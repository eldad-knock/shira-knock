# Knock - Routing Rules Engine

A flexible and extensible routing rules engine backend service that helps you automatically assign contacts to the right team members based on customizable rules and conditions.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Docker & Docker Compose
- npm or yarn

### 1. Clone and Install
```bash
git clone <your-repo-url>
cd Knock
npm install
```

### 2. Start Everything with Docker (Recommended)
```bash
docker-compose up -d
```
This will start both PostgreSQL AND your Node.js server with the initial schema and sample data.

Your API will be running at `http://localhost:3000` 🎉



## 📚 API Endpoints

### Routing Rules Management

**Get all routing rules:**
```bash
curl http://localhost:3000/api/v1/routing-rules
```

**Create new routing rules:**
```bash
curl -X POST http://localhost:3000/api/v1/routing-rules \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Routing Rules",
    "rules": [
      {
        "name": "US WIX Rule",
        "conditions": [
          {"field": "contact_country", "operator": "=", "value": "US"},
          {"field": "company_name", "operator": "=", "value": "WIX"}
        ],
        "memberId": 2,
        "priority": 0
      }
    ],
    "defaultMemberId": 1
  }'
```

**Route a contact:**
```bash
# First, get the routing rules ID:
curl http://localhost:3000/api/v1/routing-rules

# Example response:
# {
#   "success": true,
#   "data": [
#     {
#       "id": "550e8400-e29b-41d4-a716-446655440000",
#       "name": "Sample Routing Rules"
#     }
#   ]
# }

# Copy the ID from the response and use it:
curl -X POST http://localhost:3000/api/v1/routing-rules/550e8400-e29b-41d4-a716-446655440000/route \
  -H "Content-Type: application/json" \
  -d '{
    "contactInfo": {
      "contact_country": "US",
      "company_name": "WIX"
    }
  }'
```

## 🧪 Testing

### Run All Tests
```bash
npm test
```

### Run Specific Test Files
```bash
# Test the routing engine logic
npm test -- src/__tests__/routingEngine.test.ts
npm test -- src/__tests__/api.integration.test.ts

This runs a comprehensive test script that:
- Creates routing rules
- Tests routing logic
- Validates country codes
- Checks error handling

### Complete Working Example
Here's a step-by-step example that actually works:

```bash
# 1. Get all routing rules (this will show you the available IDs)
curl http://localhost:3000/api/v1/routing-rules

# 2. Copy an ID from the response and test routing
# (Replace the UUID below with one from your response)
curl -X POST http://localhost:3000/api/v1/routing-rules/550e8400-e29b-41d4-a716-446655440000/route \
  -H "Content-Type: application/json" \
  -d '{"contactInfo": {"company_name": "WIX"}}'
```

### Manual API Testing
Want to test specific scenarios? Here are some examples:

**Test case-sensitive matching:**
```bash
# This should match (exact case)
curl -X POST http://localhost:3000/api/v1/routing-rules/UUID-HERE/route \
  -H "Content-Type: application/json" \
  -d '{"contactInfo": {"company_name": "WIX"}}'

# This should NOT match (different case)
curl -X POST http://localhost:3000/api/v1/routing-rules/UUID-HERE/route \
  -H "Content-Type: application/json" \
  -d '{"contactInfo": {"company_name": "wix"}}'
```

**Test country code validation:**
```bash
# Valid country code (should work)
curl -X POST http://localhost:3000/api/v1/routing-rules/UUID-HERE/route \
  -H "Content-Type: application/json" \
  -d '{"contactInfo": {"contact_country": "US"}}'

# Invalid country code (should fail with validation error)
curl -X POST http://localhost:3000/api/v1/routing-rules/UUID-HERE/route \
  -H "Content-Type: application/json" \
  -d '{"contactInfo": {"contact_country": "Germany"}}'
```

## 🔧 Development

### Project Structure
```
src/
├── controllers/     # API endpoint handlers
├── services/        # Business logic (routing engine, country codes)
├── repositories/    # Database operations
├── validation/      # Input validation middleware
├── types/          # TypeScript type definitions
└── database/       # Database connection and schema
```

### Key Features
- **Flexible Routing Rules**: Support for multiple conditions, operators, and priorities
- **Country Code Validation**: ISO 3166-1 alpha-2 country codes with external API integration
- **Case-Sensitive Matching**: String comparisons respect exact case
- **Partial Data Support**: Contact info can be incomplete
- **Comprehensive Testing**: Unit tests and integration tests

### Available Operators
- `=` (equals)
- `!=` (not equals)
- `>` (greater than)
- `<` (less than)
- `>=` (greater than or equal)
- `<=` (less than or equal)

### Supported Fields
- `contact_country` - ISO country code (e.g., "US", "DE")
- `company_name` - Company name
- `company_industry` - Industry type
- `company_hq_country` - Company HQ country code

## 🐛 Troubleshooting

**Database connection issues?**
```bash
# Reset the database
docker-compose down -v
docker-compose up -d
```

**Tests failing?**
```bash
# Clear Jest cache
npm test -- --clearCache

# Check if database is running
docker ps
```

**Port already in use?**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

## 📝 Notes

- The routing engine is **case-sensitive** for string comparisons
- Country codes must be valid ISO 3166-1 alpha-2 codes (e.g., "US", "UK", "FR")
- Member IDs are numeric and auto-incrementing
- The system fetches country codes from an external API with fallback support
---

Happy routing! 🎯