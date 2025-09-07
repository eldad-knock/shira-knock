import { Request, Response, NextFunction } from "express";
import { ContactInfo } from "../types";
import { CountryCodeService } from "../services/countryCodeService";

/**
 * Validation error interface
 */
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

/**
 * Validates contact information
 * @param contactInfo - The contact information to validate
 * @returns Promise<ValidationError[]> - Array of validation errors (empty if valid)
 */
export async function validateContactInfo(
  contactInfo: ContactInfo
): Promise<ValidationError[]> {
  const errors: ValidationError[] = [];
  const countryService = CountryCodeService.getInstance();

  // Validate contact_country if provided
  if (contactInfo.contact_country !== undefined) {
    if (
      !(await countryService.isValidCountryCode(contactInfo.contact_country))
    ) {
      errors.push({
        field: "contact_country",
        message: `Invalid country code: ${contactInfo.contact_country}. Must be a valid ISO 3166-1 alpha-2 country code (e.g., US, GB, FR)`,
        value: contactInfo.contact_country,
      });
    }
  }

  // Validate company_hq_country if provided
  if (contactInfo.company_hq_country !== undefined) {
    if (
      !(await countryService.isValidCountryCode(contactInfo.company_hq_country))
    ) {
      errors.push({
        field: "company_hq_country",
        message: `Invalid country code: ${contactInfo.company_hq_country}. Must be a valid ISO 3166-1 alpha-2 country code (e.g., US, GB, FR)`,
        value: contactInfo.company_hq_country,
      });
    }
  }

  // Validate company_size if provided
  if (contactInfo.company_size !== undefined) {
    if (
      typeof contactInfo.company_size !== "number" ||
      contactInfo.company_size < 0
    ) {
      errors.push({
        field: "company_size",
        message: "Company size must be a positive number",
        value: contactInfo.company_size,
      });
    }
  }

  // Validate first_seen and last_seen if provided
  if (contactInfo.first_seen !== undefined) {
    if (!isValidDateString(contactInfo.first_seen)) {
      errors.push({
        field: "first_seen",
        message:
          "First seen must be a valid ISO date string (YYYY-MM-DD or ISO 8601 format)",
        value: contactInfo.first_seen,
      });
    }
  }

  if (contactInfo.last_seen !== undefined) {
    if (!isValidDateString(contactInfo.last_seen)) {
      errors.push({
        field: "last_seen",
        message:
          "Last seen must be a valid ISO date string (YYYY-MM-DD or ISO 8601 format)",
        value: contactInfo.last_seen,
      });
    }
  }

  // Validate that first_seen is before last_seen if both are provided
  if (contactInfo.first_seen && contactInfo.last_seen) {
    const firstSeen = new Date(contactInfo.first_seen);
    const lastSeen = new Date(contactInfo.last_seen);

    if (firstSeen > lastSeen) {
      errors.push({
        field: "first_seen",
        message: "First seen date must be before or equal to last seen date",
        value: contactInfo.first_seen,
      });
    }
  }

  return errors;
}

/**
 * Validates if a string is a valid date
 * @param dateString - The date string to validate
 * @returns true if valid, false otherwise
 */
function isValidDateString(dateString: string): boolean {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

/**
 * Middleware to validate contact information in request body
 */
export async function validateContactInfoMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const contactInfo = req.body.contactInfo || req.body;

  if (!contactInfo || typeof contactInfo !== "object") {
    res.status(400).json({
      error: "Invalid request body",
      message: "Request body must contain contact information",
    });
    return;
  }

  const errors = await validateContactInfo(contactInfo);

  if (errors.length > 0) {
    res.status(400).json({
      error: "Validation failed",
      message: "Contact information validation failed",
      details: errors,
    });
    return;
  }

  next();
}

/**
 * Middleware to validate routing rules creation/update
 */
export async function validateRoutingRulesMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { rules } = req.body;

  if (!rules || !Array.isArray(rules)) {
    res.status(400).json({
      error: "Invalid request body",
      message: "Rules must be an array",
    });
    return;
  }

  const errors: ValidationError[] = [];
  const countryService = CountryCodeService.getInstance();

  // Validate each rule
  for (let index = 0; index < rules.length; index++) {
    const rule = rules[index];

    if (!rule.conditions || !Array.isArray(rule.conditions)) {
      errors.push({
        field: `rules[${index}].conditions`,
        message: "Rule conditions must be an array",
      });
      continue;
    }

    // Validate each condition
    for (
      let conditionIndex = 0;
      conditionIndex < rule.conditions.length;
      conditionIndex++
    ) {
      const condition = rule.conditions[conditionIndex];

      if (
        condition.field === "contact_country" ||
        condition.field === "company_hq_country"
      ) {
        const isValid = await countryService.isValidCountryCode(
          condition.value
        );
        if (!isValid) {
          errors.push({
            field: `rules[${index}].conditions[${conditionIndex}].value`,
            message: `Invalid country code: ${condition.value}. Must be a valid ISO 3166-1 alpha-2 country code`,
            value: condition.value,
          });
        }
      }
    }
  }

  if (errors.length > 0) {
    res.status(400).json({
      error: "Validation failed",
      message: "Routing rules validation failed",
      details: errors,
    });
    return;
  }

  next();
}
