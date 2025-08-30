import { RoutingEngine } from "../services/routingEngine";
import { RoutingRules, ContactInfo, Operator, CompanyIndustry } from "../types";

describe("RoutingEngine", () => {
  let routingEngine: RoutingEngine;
  let sampleRoutingRules: RoutingRules;

  beforeEach(() => {
    routingEngine = new RoutingEngine();

    sampleRoutingRules = {
      id: "test-id",
      name: "Test Routing Rules",
      rules: [
        {
          id: "rule-1",
          name: "High Priority Rule",
          conditions: [
            {
              field: "contact_country",
              operator: Operator.EQUALS,
              value: "US",
            },
            { field: "company_name", operator: Operator.EQUALS, value: "WIX" },
          ],
          memberId: 2,
          priority: 0,
        },
        {
          id: "rule-2",
          name: "Medium Priority Rule",
          conditions: [
            {
              field: "company_industry",
              operator: Operator.EQUALS,
              value: CompanyIndustry.ACCOUNTING,
            },
          ],
          memberId: 3, // Alon
          priority: 1,
        },
      ],
      defaultMemberId: 1, // Stav
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });

  describe("routeContact", () => {
    it("should return the highest priority matching rule", async () => {
      const contactInfo: ContactInfo = {
        contact_country: "US",
        company_name: "WIX",
      };

      const result = await routingEngine.routeContact(
        sampleRoutingRules,
        contactInfo
      );

      expect(result.memberId).toBe(2);
      expect(result.appliedRuleId).toBe("rule-1");
      expect(result.appliedRuleName).toBe("High Priority Rule");
    });

    it("should return default member when no rules match", async () => {
      const contactInfo: ContactInfo = {
        contact_country: "Canada",
        company_name: "Other Company",
      };

      const result = await routingEngine.routeContact(
        sampleRoutingRules,
        contactInfo
      );

      expect(result.memberId).toBe(1);
      expect(result.appliedRuleId).toBeUndefined();
      expect(result.appliedRuleName).toBeUndefined();
    });

    it("should handle partial contact information", async () => {
      const contactInfo: ContactInfo = {
        company_industry: CompanyIndustry.ACCOUNTING,
      };

      const result = await routingEngine.routeContact(
        sampleRoutingRules,
        contactInfo
      );

      expect(result.memberId).toBe(3);
      expect(result.appliedRuleId).toBe("rule-2");
    });
  });

  describe("condition evaluation", () => {
    it("should not match when case differs", async () => {
      const routingRules: RoutingRules = {
        ...sampleRoutingRules,
        rules: [
          {
            id: "case-sensitive-rule",
            name: "Case Sensitive Rule",
            conditions: [
              {
                field: "company_name",
                operator: Operator.EQUALS,
                value: "wix",
              },
            ],
            memberId: 6,
            priority: 0,
          },
        ],
      };

      const contactInfo: ContactInfo = {
        company_name: "WIX",
      };

      const result = await routingEngine.routeContact(
        routingRules,
        contactInfo
      );

      expect(result.memberId).toBe(1);
      expect(result.appliedRuleId).toBeUndefined();
      expect(result.appliedRuleName).toBeUndefined();
    });

    it("should handle numeric conditions", async () => {
      const routingRules: RoutingRules = {
        ...sampleRoutingRules,
        rules: [
          {
            id: "numeric-rule",
            name: "Numeric Rule",
            conditions: [
              {
                field: "company_size",
                operator: Operator.GREATER_THAN,
                value: 100,
              },
            ],
            memberId: 6,
            priority: 0,
          },
        ],
      };

      const contactInfo: ContactInfo = {
        company_size: 150,
      };

      const result = await routingEngine.routeContact(
        routingRules,
        contactInfo
      );

      expect(result.memberId).toBe(6);
    });
  });

  describe("country code validation", () => {
    it("should handle valid ISO country codes in contact_country", async () => {
      const routingRules: RoutingRules = {
        ...sampleRoutingRules,
        rules: [
          {
            id: "country-rule",
            name: "Country Rule",
            conditions: [
              {
                field: "contact_country",
                operator: Operator.EQUALS,
                value: "US",
              },
            ],
            memberId: 4,
            priority: 0,
          },
        ],
      };

      const contactInfo: ContactInfo = {
        contact_country: "US",
      };

      const result = await routingEngine.routeContact(
        routingRules,
        contactInfo
      );

      expect(result.memberId).toBe(4);
      expect(result.appliedRuleId).toBe("country-rule");
      expect(result.appliedRuleName).toBe("Country Rule");
    });

    it("should handle valid ISO country codes in company_hq_country", async () => {
      const routingRules: RoutingRules = {
        ...sampleRoutingRules,
        rules: [
          {
            id: "hq-country-rule",
            name: "HQ Country Rule",
            conditions: [
              {
                field: "company_hq_country",
                operator: Operator.EQUALS,
                value: "GB",
              },
            ],
            memberId: 5,
            priority: 0,
          },
        ],
      };

      const contactInfo: ContactInfo = {
        company_hq_country: "GB",
      };

      const result = await routingEngine.routeContact(
        routingRules,
        contactInfo
      );

      expect(result.memberId).toBe(5);
      expect(result.appliedRuleId).toBe("hq-country-rule");
      expect(result.appliedRuleName).toBe("HQ Country Rule");
    });

    it("should handle multiple country code conditions", async () => {
      const routingRules: RoutingRules = {
        ...sampleRoutingRules,
        rules: [
          {
            id: "multi-country-rule",
            name: "Multi Country Rule",
            conditions: [
              {
                field: "contact_country",
                operator: Operator.EQUALS,
                value: "US",
              },
              {
                field: "company_hq_country",
                operator: Operator.EQUALS,
                value: "CA",
              },
            ],
            memberId: 6,
            priority: 0,
          },
        ],
      };

      const contactInfo: ContactInfo = {
        contact_country: "US",
        company_hq_country: "CA",
      };

      const result = await routingEngine.routeContact(
        routingRules,
        contactInfo
      );

      expect(result.memberId).toBe(6);
      expect(result.appliedRuleId).toBe("multi-country-rule");
    });

    it("should handle mixed country and non-country conditions", async () => {
      const routingRules: RoutingRules = {
        ...sampleRoutingRules,
        rules: [
          {
            id: "mixed-rule",
            name: "Mixed Rule",
            conditions: [
              {
                field: "contact_country",
                operator: Operator.EQUALS,
                value: "FR",
              },
              {
                field: "company_name",
                operator: Operator.EQUALS,
                value: "TechCorp",
              },
            ],
            memberId: 7,
            priority: 0,
          },
        ],
      };

      const contactInfo: ContactInfo = {
        contact_country: "FR",
        company_name: "TechCorp",
      };

      const result = await routingEngine.routeContact(
        routingRules,
        contactInfo
      );

      expect(result.memberId).toBe(7);
      expect(result.appliedRuleId).toBe("mixed-rule");
    });

    it("should handle country codes with different operators", async () => {
      const routingRules: RoutingRules = {
        ...sampleRoutingRules,
        rules: [
          {
            id: "country-equals-rule",
            name: "Country Equals Rule",
            conditions: [
              {
                field: "contact_country",
                operator: Operator.EQUALS,
                value: "DE",
              },
            ],
            memberId: 8,
            priority: 0,
          },
        ],
      };

      const contactInfo: ContactInfo = {
        contact_country: "DE",
      };

      const result = await routingEngine.routeContact(
        routingRules,
        contactInfo
      );

      expect(result.memberId).toBe(8);
      expect(result.appliedRuleId).toBe("country-equals-rule");
    });

    it("should handle partial country code information", async () => {
      const routingRules: RoutingRules = {
        ...sampleRoutingRules,
        rules: [
          {
            id: "partial-country-rule",
            name: "Partial Country Rule",
            conditions: [
              {
                field: "contact_country",
                operator: Operator.EQUALS,
                value: "JP",
              },
            ],
            memberId: 9,
            priority: 0,
          },
        ],
      };

      // Only contact_country provided, no company_hq_country
      const contactInfo: ContactInfo = {
        contact_country: "JP",
      };

      const result = await routingEngine.routeContact(
        routingRules,
        contactInfo
      );

      expect(result.memberId).toBe(9);
      expect(result.appliedRuleId).toBe("partial-country-rule");
    });

    it("should handle empty contact info with country-based rules", async () => {
      const routingRules: RoutingRules = {
        ...sampleRoutingRules,
        rules: [
          {
            id: "country-only-rule",
            name: "Country Only Rule",
            conditions: [
              {
                field: "contact_country",
                operator: Operator.EQUALS,
                value: "AU",
              },
            ],
            memberId: 10,
            priority: 0,
          },
        ],
      };

      const contactInfo: ContactInfo = {};

      const result = await routingEngine.routeContact(
        routingRules,
        contactInfo
      );

      expect(result.memberId).toBe(1);
      expect(result.appliedRuleId).toBeUndefined();
      expect(result.appliedRuleName).toBeUndefined();
    });
  });
});
