// Enums for supported values
export enum CompanyIndustry {
  ACCOUNTING = "ACCOUNTING",
  AIRLINES_AVIATION = "AIRLINES_AVIATION",
  ANIMATION = "ANIMATION",
  APPAREL_FASHION = "APPAREL_FASHION",
  ARCHITECTURE_PLANNING = "ARCHITECTURE_PLANNING",
  ARTS_AND_CRAFTS = "ARTS_AND_CRAFTS",
  AUTOMOTIVE = "AUTOMOTIVE",
  AVIATION_AEROSPACE = "AVIATION_AEROSPACE",
  BANKING = "BANKING",
  BIOTECHNOLOGY = "BIOTECHNOLOGY",
  BROADCAST_MEDIA = "BROADCAST_MEDIA",
  BUILDING_MATERIALS = "BUILDING_MATERIALS",
  BUSINESS_SUPPLIES_AND_EQUIPMENT = "BUSINESS_SUPPLIES_AND_EQUIPMENT",
  CAPITAL_MARKETS = "CAPITAL_MARKETS",
  CHEMICALS = "CHEMICALS",
  CIVIC_SOCIAL_ORGANIZATION = "CIVIC_SOCIAL_ORGANIZATION",
  CIVIL_ENGINEERING = "CIVIL_ENGINEERING",
}

export enum ContactDevice {
  TABLET = "Tablet",
  PC = "PC",
  MOBILE = "Mobile",
}

// Supported operators
export enum Operator {
  EQUALS = "=",
  GREATER_THAN = ">",
  LESS_THAN = "<",
}

// Member interface
export interface Member {
  id: number;
  name: string;
  email?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Condition types
export interface StringCondition {
  field: "company_name" | "first_page";
  operator: Operator.EQUALS;
  value: string;
}

export interface CountryCondition {
  field: "contact_country" | "company_hq_country";
  operator: Operator.EQUALS;
  value: string;
}

export interface NumberCondition {
  field: "company_size";
  operator: Operator.EQUALS | Operator.GREATER_THAN | Operator.LESS_THAN;
  value: number;
}

export interface EnumCondition {
  field: "company_industry" | "contact_device";
  operator: Operator.EQUALS;
  value: CompanyIndustry | ContactDevice;
}

export interface DateCondition {
  field: "first_seen" | "last_seen";
  operator: Operator.EQUALS | Operator.GREATER_THAN | Operator.LESS_THAN;
  value: string; // ISO date string
}

export type Condition =
  | StringCondition
  | CountryCondition
  | NumberCondition
  | EnumCondition
  | DateCondition;

// Rule structure
export interface Rule {
  id: string;
  name: string;
  conditions: Condition[];
  memberId: number;
  priority: number;
}

// Routing rules structure
export interface RoutingRules {
  id: string;
  name: string;
  rules: Rule[];
  defaultMemberId: number;
  defaultMemberName?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Contact information
export interface ContactInfo {
  contact_country?: string;
  company_size?: number;
  company_hq_country?: string;
  company_industry?: CompanyIndustry;
  company_name?: string;
  contact_device?: ContactDevice;
  first_page?: string;
  first_seen?: string;
  last_seen?: string;
}

// API request/response types
export interface CreateRoutingRulesRequest {
  name: string;
  rules: Omit<Rule, "id">[];
  defaultMemberId: number;
}

export interface UpdateRoutingRulesRequest {
  name?: string;
  rules?: Omit<Rule, "id">[];
  defaultMemberId?: number;
}

export interface RouteContactRequest {
  routingRulesId: string;
  contactInfo: ContactInfo;
}

export interface RouteContactResponse {
  memberId: number;
  memberName?: string;
  appliedRuleId?: string;
  appliedRuleName?: string;
}

// Member management types
export interface CreateMemberRequest {
  name: string;
  email?: string;
}

export interface UpdateMemberRequest {
  name?: string;
  email?: string;
  isActive?: boolean;
}

// Database types
export interface DatabaseMember {
  id: number;
  name: string;
  email: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface DatabaseRule {
  id: string;
  routing_rules_id: string;
  name: string;
  conditions: string; // JSON string
  member_id: number;
  priority: number;
  created_at: Date;
  updated_at: Date;
}

export interface DatabaseRoutingRules {
  id: string;
  name: string;
  default_member_id: number;
  created_at: Date;
  updated_at: Date;
}
