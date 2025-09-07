import { RoutingRulesRepository } from "../repositories/routingRulesRepository";
import { RoutingEngine } from "./routingEngine";
import {
  RoutingRules,
  CreateRoutingRulesRequest,
  UpdateRoutingRulesRequest,
  ContactInfo,
  RouteContactResponse,
} from "../types";

export class RoutingRulesService {
  private repository: RoutingRulesRepository;
  private routingEngine: RoutingEngine;

  constructor() {
    this.repository = new RoutingRulesRepository();
    this.routingEngine = new RoutingEngine();
  }

  async createRoutingRules(
    request: CreateRoutingRulesRequest
  ): Promise<RoutingRules> {
    if (!request.name || !request.defaultMemberId) {
      throw new Error("Name and defaultMemberId are required");
    }

    if (!Array.isArray(request.rules)) {
      throw new Error("Rules must be an array");
    }

    for (const rule of request.rules) {
      if (!rule.name || !rule.memberId) {
        throw new Error("Each rule must have a name and memberId");
      }

      if (!Array.isArray(rule.conditions)) {
        throw new Error("Rule conditions must be an array");
      }

      for (const condition of rule.conditions) {
        if (
          !condition.field ||
          !condition.operator ||
          condition.value === undefined
        ) {
          throw new Error(
            "Each condition must have field, operator, and value"
          );
        }
      }
    }

    return await this.repository.create(request);
  }

  async getRoutingRules(id: string): Promise<RoutingRules | null> {
    return await this.repository.findById(id);
  }

  async getAllRoutingRules(): Promise<RoutingRules[]> {
    return await this.repository.findAll();
  }

  async updateRoutingRules(
    id: string,
    updates: UpdateRoutingRulesRequest
  ): Promise<RoutingRules | null> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error("Routing rules not found");
    }

    if (updates.rules !== undefined) {
      if (!Array.isArray(updates.rules)) {
        throw new Error("Rules must be an array");
      }

      for (const rule of updates.rules) {
        if (!rule.name || !rule.memberId) {
          throw new Error("Each rule must have a name and memberId");
        }

        if (!Array.isArray(rule.conditions)) {
          throw new Error("Rule conditions must be an array");
        }

        for (const condition of rule.conditions) {
          if (
            !condition.field ||
            !condition.operator ||
            condition.value === undefined
          ) {
            throw new Error(
              "Each condition must have field, operator, and value"
            );
          }
        }
      }
    }

    return await this.repository.update(id, updates);
  }

  async deleteRoutingRules(id: string): Promise<boolean> {
    return await this.repository.delete(id);
  }

  async routeContact(
    routingRulesId: string,
    contactInfo: ContactInfo
  ): Promise<RouteContactResponse> {
    const routingRules = await this.repository.findById(routingRulesId);
    if (!routingRules) {
      throw new Error("Routing rules not found");
    }

    return await this.routingEngine.routeContact(routingRules, contactInfo);
  }
}
