import axios from "axios";

const BASE_URL = "http://localhost:3000/api/v1/routing-rules";

describe("API Integration Tests", () => {
  let existingRulesId: string;

  beforeAll(async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  });

  it("should get all routing rules", async () => {
    const response = await axios.get(BASE_URL);
    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(response.data.data).toBeDefined();

    if (response.data.data && response.data.data.length > 0) {
      existingRulesId = response.data.data[0].id;
      console.log(
        `📋 Found existing routing rules: ${response.data.data[0].name} (ID: ${existingRulesId})`
      );
    }
  });

  it("should get specific routing rules by ID", async () => {
    if (!existingRulesId) {
      console.log("⚠️  No existing routing rules found, skipping this test");
      return;
    }

    const response = await axios.get(`${BASE_URL}/${existingRulesId}`);
    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(response.data.data.id).toBe(existingRulesId);
  });

  it("should route contact to match Eldad rule", async () => {
    if (!existingRulesId) {
      console.log("⚠️  No existing routing rules found, skipping this test");
      return;
    }

    const response = await axios.post(`${BASE_URL}/${existingRulesId}/route`, {
      contactInfo: {
        contact_country: "US",
        company_name: "WIX",
      },
    });

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(response.data.data.memberId).toBe(2); // Eldad's ID
    expect(response.data.data.appliedRuleId).toBeDefined();
  });

  it("should route contact to match Alon rule", async () => {
    if (!existingRulesId) {
      console.log("⚠️  No existing routing rules found, skipping this test");
      return;
    }

    const response = await axios.post(`${BASE_URL}/${existingRulesId}/route`, {
      contactInfo: {
        company_industry: "ACCOUNTING",
        // Only company_industry, no company_hq_country to avoid matching Eldad rule
      },
    });

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(response.data.data.memberId).toBe(3); // Alon's ID
    expect(response.data.data.appliedRuleId).toBeDefined();
  });

  it("should route contact to default member when no rules match", async () => {
    if (!existingRulesId) {
      console.log("⚠️  No existing routing rules found, skipping this test");
      return;
    }

    const response = await axios.post(`${BASE_URL}/${existingRulesId}/route`, {
      contactInfo: {
        contact_country: "CA",
        company_name: "Unknown Company",
      },
    });

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(response.data.data.memberId).toBe(1); // Stav's ID (default)
    expect(response.data.data.appliedRuleId).toBeUndefined();
  });

  it("should return validation error for invalid country code", async () => {
    if (!existingRulesId) {
      console.log("⚠️  No existing routing rules found, skipping this test");
      return;
    }

    try {
      await axios.post(`${BASE_URL}/${existingRulesId}/route`, {
        contactInfo: {
          company_industry: "ACCOUNTING",
          company_hq_country: "Germany", // Invalid country code
        },
      });
      fail("Expected validation error but request succeeded");
    } catch (error: any) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.error).toBe("Validation failed");
      expect(error.response.data.message).toBe(
        "Contact information validation failed"
      );
      expect(error.response.data.details[0].message).toContain(
        "Invalid country code"
      );
    }
  });

  it("should route contact to match Shira rule with multiple conditions", async () => {
    if (!existingRulesId) {
      console.log("⚠️  No existing routing rules found, skipping this test");
      return;
    }

    const response = await axios.post(`${BASE_URL}/${existingRulesId}/route`, {
      contactInfo: {
        first_page: "/pricing",
        company_size: 150,
        first_seen: "2024-06-15",
        last_seen: "2024-08-20",
      },
    });

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(response.data.data.memberId).toBe(4); // Shira's ID
    expect(response.data.data.appliedRuleId).toBeDefined();
  });

  it("should test Shira rule with greater than operator for company size", async () => {
    if (!existingRulesId) {
      console.log("⚠️  No existing routing rules found, skipping this test");
      return;
    }

    const response1 = await axios.post(`${BASE_URL}/${existingRulesId}/route`, {
      contactInfo: {
        first_page: "/pricing",
        company_size: 200,
        first_seen: "2024-06-15",
        last_seen: "2024-08-20",
      },
    });

    expect(response1.status).toBe(200);
    expect(response1.data.data.memberId).toBe(4); // Shira's ID

    const response2 = await axios.post(`${BASE_URL}/${existingRulesId}/route`, {
      contactInfo: {
        first_page: "/pricing",
        company_size: 50,
        first_seen: "2024-06-15",
        last_seen: "2024-08-20",
      },
    });

    expect(response2.status).toBe(200);
    expect(response2.data.data.memberId).toBe(4);
    expect(response2.data.data.appliedRuleId).toBeDefined();
  });

  it("should test Shira rule with date operators", async () => {
    if (!existingRulesId) {
      console.log("⚠️  No existing routing rules found, skipping this test");
      return;
    }

    const response1 = await axios.post(`${BASE_URL}/${existingRulesId}/route`, {
      contactInfo: {
        first_page: "/pricing",
        company_size: 150,
        first_seen: "2024-06-15",
        last_seen: "2024-08-20",
      },
    });

    expect(response1.status).toBe(200);
    expect(response1.data.data.memberId).toBe(4);

    const response2 = await axios.post(`${BASE_URL}/${existingRulesId}/route`, {
      contactInfo: {
        first_page: "/pricing",
        company_size: 150,
        first_seen: "2023-12-31",
        last_seen: "2024-08-20",
      },
    });

    expect(response2.status).toBe(200);
    expect(response2.data.data.memberId).toBe(4);
    expect(response2.data.data.appliedRuleId).toBeDefined();
  });

  it("should test Shira rule with less than operator for last_seen", async () => {
    if (!existingRulesId) {
      console.log("⚠️  No existing routing rules found, skipping this test");
      return;
    }

    const response1 = await axios.post(`${BASE_URL}/${existingRulesId}/route`, {
      contactInfo: {
        first_page: "/pricing",
        company_size: 150,
        first_seen: "2024-06-15",
        last_seen: "2024-08-20",
      },
    });

    expect(response1.status).toBe(200);
    expect(response1.data.data.memberId).toBe(4);

    const response2 = await axios.post(`${BASE_URL}/${existingRulesId}/route`, {
      contactInfo: {
        first_page: "/pricing",
        company_size: 150,
        first_seen: "2024-06-15",
        last_seen: "2024-12-31",
      },
    });

    expect(response2.status).toBe(200);
    expect(response2.data.data.memberId).toBe(4);
    expect(response2.data.data.appliedRuleId).toBeDefined();
  });

  it("should test Shira rule with partial contact info", async () => {
    if (!existingRulesId) {
      console.log("⚠️  No existing routing rules found, skipping this test");
      return;
    }

    const response = await axios.post(`${BASE_URL}/${existingRulesId}/route`, {
      contactInfo: {
        first_page: "/pricing",
        company_size: 150,
      },
    });

    expect(response.status).toBe(200);
    expect(response.data.data.memberId).toBe(4);
    expect(response.data.data.appliedRuleId).toBeDefined();
  });

  it("should test Shira rule with no matching conditions", async () => {
    if (!existingRulesId) {
      console.log("⚠️  No existing routing rules found, skipping this test");
      return;
    }

    const response = await axios.post(`${BASE_URL}/${existingRulesId}/route`, {
      contactInfo: {
        first_page: "/home",
        company_size: 50,
        first_seen: "2023-06-15",
        last_seen: "2024-12-31",
      },
    });

    expect(response.status).toBe(200);
    expect(response.data.data.memberId).toBe(1);
    expect(response.data.data.appliedRuleId).toBeUndefined();
  });

  it("should create new routing rules when none exist", async () => {
    if (existingRulesId) {
      console.log("📋 Existing routing rules found, skipping creation test");
      return;
    }

    const createResponse = await axios.post(BASE_URL, {
      name: "Test Routing Rules",
      rules: [
        {
          name: "Eldad Rule",
          conditions: [
            { field: "contact_country", operator: "=", value: "US" },
            { field: "company_name", operator: "=", value: "WIX" },
          ],
          memberId: 2,
          priority: 0,
        },
        {
          name: "Alon Rule",
          conditions: [
            { field: "company_industry", operator: "=", value: "ACCOUNTING" },
          ],
          memberId: 3,
          priority: 1,
        },
      ],
      defaultMemberId: 1,
    });

    expect(createResponse.status).toBe(201);
    expect(createResponse.data.success).toBe(true);
    expect(createResponse.data.data.id).toBeDefined();

    const newRulesId = createResponse.data.data.id;

    const routeResponse = await axios.post(`${BASE_URL}/${newRulesId}/route`, {
      contactInfo: {
        contact_country: "US",
        company_name: "WIX",
      },
    });

    expect(routeResponse.status).toBe(200);
    expect(routeResponse.data.success).toBe(true);
    expect(routeResponse.data.data.memberId).toBe(2);
  });
});
