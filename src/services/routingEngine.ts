import {
  Condition,
  ContactInfo,
  Rule,
  RoutingRules,
  RouteContactResponse,
} from "../types";

export class RoutingEngine {
  constructor() {}

  /**
   * Route a contact based on routing rules
   */
  public async routeContact(
    routingRules: RoutingRules,
    contactInfo: ContactInfo
  ): Promise<RouteContactResponse> {
    const sortedRules = [...routingRules.rules].sort(
      (a, b) => a.priority - b.priority
    );

    for (const rule of sortedRules) {
      if (this.evaluateRule(rule, contactInfo)) {
        return {
          memberId: rule.memberId,
          appliedRuleId: rule.id,
          appliedRuleName: rule.name,
        };
      }
    }

    return {
      memberId: routingRules.defaultMemberId,
    };
  }

  /**
   * Evaluate if a rule matches the contact information
   */
  private evaluateRule(rule: Rule, contactInfo: ContactInfo): boolean {
    if (rule.conditions.length === 0) {
      return true;
    }

    const result = rule.conditions.some((condition) =>
      this.evaluateCondition(condition, contactInfo)
    );

    return result;
  }

  /**
   * Evaluate a single condition against contact information
   */
  private evaluateCondition(
    condition: Condition,
    contactInfo: ContactInfo
  ): boolean {
    const fieldValue = contactInfo[condition.field as keyof ContactInfo];

    if (fieldValue === undefined || fieldValue === null) {
      return false;
    }

    switch (condition.operator) {
      case "=":
        return this.equals(fieldValue, condition.value);
      case ">":
        return this.greaterThan(fieldValue, condition.value);
      case "<":
        return this.lessThan(fieldValue, condition.value);
      default:
        return false;
    }
  }

  /**
   * Check if two values are equal
   */
  private equals(a: any, b: any): boolean {
    if (typeof a === "string" && typeof b === "string") {
      return a === b;
    }
    return a === b;
  }

  /**
   * Check if first value is greater than second
   */
  private greaterThan(a: any, b: any): boolean {
    if (typeof a === "number" && typeof b === "number") {
      return a > b;
    }
    if (a instanceof Date && b instanceof Date) {
      return a > b;
    }
    if (typeof a === "string" && typeof b === "string") {
      const dateA = new Date(a);
      const dateB = new Date(b);
      if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
        return dateA > dateB;
      }
    }
    return false;
  }

  /**
   * Check if first value is less than second
   */
  private lessThan(a: any, b: any): boolean {
    if (typeof a === "number" && typeof b === "number") {
      return a < b;
    }
    if (a instanceof Date && b instanceof Date) {
      return a < b;
    }
    if (typeof a === "string" && typeof b === "string") {
      const dateA = new Date(a);
      const dateB = new Date(b);
      if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
        return dateA < dateB;
      }
    }
    return false;
  }
}
