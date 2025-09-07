import DatabaseConnection from "../database/connection";
import {
  RoutingRules,
  Rule,
  CreateRoutingRulesRequest,
  UpdateRoutingRulesRequest,
  DatabaseRoutingRules,
  DatabaseRule,
} from "../types";

export class RoutingRulesRepository {
  private db: DatabaseConnection;

  constructor() {
    this.db = DatabaseConnection.getInstance();
  }

  async create(routingRules: CreateRoutingRulesRequest): Promise<RoutingRules> {
    const client = await this.db.getClient();

    try {
      await client.query("BEGIN");

      const routingRulesResult = await client.query(
        `INSERT INTO routing_rules (name, default_member_id) 
         VALUES ($1, $2) RETURNING *`,
        [routingRules.name, routingRules.defaultMemberId]
      );

      const dbRoutingRules = routingRulesResult.rows[0] as DatabaseRoutingRules;

      const createdRules: Rule[] = [];
      for (const rule of routingRules.rules) {
        const ruleResult = await client.query(
          `INSERT INTO rules (routing_rules_id, name, conditions, member_id, priority) 
           VALUES ($1, $2, $3, $4, $5) RETURNING *`,
          [
            dbRoutingRules.id,
            rule.name,
            JSON.stringify(rule.conditions),
            rule.memberId,
            rule.priority,
          ]
        );

        const dbRule = ruleResult.rows[0] as DatabaseRule;
        createdRules.push({
          id: dbRule.id,
          name: dbRule.name,
          conditions:
            typeof dbRule.conditions === "string"
              ? JSON.parse(dbRule.conditions)
              : dbRule.conditions,
          memberId: dbRule.member_id,
          priority: dbRule.priority,
        });
      }

      await client.query("COMMIT");

      return {
        id: dbRoutingRules.id,
        name: dbRoutingRules.name,
        rules: createdRules,
        defaultMemberId: dbRoutingRules.default_member_id,
        createdAt: dbRoutingRules.created_at,
        updatedAt: dbRoutingRules.updated_at,
      };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async findById(id: string): Promise<RoutingRules | null> {
    try {
      const routingRulesResult = await this.db.query(
        `
        SELECT rr.*, m.name as default_member_name 
        FROM routing_rules rr
        JOIN members m ON rr.default_member_id = m.id
        WHERE rr.id = $1
      `,
        [id]
      );

      if (routingRulesResult.rows.length === 0) {
        return null;
      }

      const dbRoutingRules = routingRulesResult
        .rows[0] as DatabaseRoutingRules & { default_member_name: string };

      const rulesResult = await this.db.query(
        `
        SELECT r.*, m.name as member_name
        FROM rules r
        JOIN members m ON r.member_id = m.id
        WHERE r.routing_rules_id = $1 
        ORDER BY r.priority ASC
      `,
        [id]
      );

      const rules: Rule[] = rulesResult.rows.map(
        (ruleRow: DatabaseRule & { member_name: string }) => ({
          id: ruleRow.id,
          name: ruleRow.name,
          conditions:
            typeof ruleRow.conditions === "string"
              ? JSON.parse(ruleRow.conditions)
              : ruleRow.conditions,
          memberId: ruleRow.member_id,
          priority: ruleRow.priority,
        })
      );

      return {
        id: dbRoutingRules.id,
        name: dbRoutingRules.name,
        rules,
        defaultMemberId: dbRoutingRules.default_member_id,
        defaultMemberName: dbRoutingRules.default_member_name,
        createdAt: dbRoutingRules.created_at,
        updatedAt: dbRoutingRules.updated_at,
      };
    } catch (error) {
      console.error("Error finding routing rules by ID:", error);
      throw error;
    }
  }

  async findAll(): Promise<RoutingRules[]> {
    try {
      const routingRulesResult = await this.db.query(`
        SELECT rr.*, m.name as default_member_name 
        FROM routing_rules rr
        JOIN members m ON rr.default_member_id = m.id
        ORDER BY rr.created_at DESC
      `);

      const routingRules: RoutingRules[] = [];

      for (const dbRoutingRules of routingRulesResult.rows as (DatabaseRoutingRules & {
        default_member_name: string;
      })[]) {
        const rulesResult = await this.db.query(
          `
          SELECT r.*, m.name as member_name
          FROM rules r
          JOIN members m ON r.member_id = m.id
          WHERE r.routing_rules_id = $1 
          ORDER BY r.priority ASC
        `,
          [dbRoutingRules.id]
        );

        const rules: Rule[] = rulesResult.rows.map(
          (ruleRow: DatabaseRule & { member_name: string }) => ({
            id: ruleRow.id,
            name: ruleRow.name,
            conditions:
              typeof ruleRow.conditions === "string"
                ? JSON.parse(ruleRow.conditions)
                : ruleRow.conditions,
            memberId: ruleRow.member_id,
            priority: ruleRow.priority,
          })
        );

        routingRules.push({
          id: dbRoutingRules.id,
          name: dbRoutingRules.name,
          rules,
          defaultMemberId: dbRoutingRules.default_member_id,
          defaultMemberName: dbRoutingRules.default_member_name,
          createdAt: dbRoutingRules.created_at,
          updatedAt: dbRoutingRules.updated_at,
        });
      }

      return routingRules;
    } catch (error) {
      console.error("Error finding all routing rules:", error);
      throw error;
    }
  }

  async update(
    id: string,
    updates: UpdateRoutingRulesRequest
  ): Promise<RoutingRules | null> {
    const client = await this.db.getClient();

    try {
      await client.query("BEGIN");

      const updateFields: string[] = [];
      const updateValues: any[] = [];
      let paramIndex = 1;

      if (updates.name !== undefined) {
        updateFields.push(`name = $${paramIndex++}`);
        updateValues.push(updates.name);
      }

      if (updates.defaultMemberId !== undefined) {
        updateFields.push(`default_member_id = $${paramIndex++}`);
        updateValues.push(updates.defaultMemberId);
      }

      if (updateFields.length > 0) {
        updateValues.push(id);
        await client.query(
          `UPDATE routing_rules SET ${updateFields.join(
            ", "
          )}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramIndex}`,
          updateValues
        );
      }

      if (updates.rules !== undefined) {
        await client.query("DELETE FROM rules WHERE routing_rules_id = $1", [
          id,
        ]);

        for (const rule of updates.rules) {
          await client.query(
            `INSERT INTO rules (routing_rules_id, name, conditions, member_id, priority) 
             VALUES ($1, $2, $3, $4, $5)`,
            [
              id,
              rule.name,
              JSON.stringify(rule.conditions),
              rule.memberId,
              rule.priority,
            ]
          );
        }
      }

      await client.query("COMMIT");

      return await this.findById(id);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.db.query(
        "DELETE FROM routing_rules WHERE id = $1 RETURNING id",
        [id]
      );
      return result.rows.length > 0;
    } catch (error) {
      console.error("Error deleting routing rules:", error);
      throw error;
    }
  }
}
