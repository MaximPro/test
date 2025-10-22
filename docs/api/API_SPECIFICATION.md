# API Specification
## Local AI CRM & SuperSynergy REST API

---

## Overview

This document specifies the REST API for the Local AI CRM and SuperSynergy systems.

**Base URL**: `http://localhost:3000/api`
**Authentication**: JWT Bearer token
**Content Type**: `application/json`
**API Version**: v1

---

## Table of Contents

1. [Authentication](#authentication)
2. [Contacts API](#contacts-api)
3. [Deals API](#deals-api)
4. [Interactions API](#interactions-api)
5. [Workflows API](#workflows-api)
6. [AI Agents API](#ai-agents-api)
7. [Analytics API](#analytics-api)
8. [Webhooks API](#webhooks-api)
9. [Error Handling](#error-handling)

---

## Authentication

### POST /api/auth/register
Register a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "userId": "user_abc123",
    "email": "user@example.com",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "rt_xyz789",
    "expiresIn": 900
  }
}
```

---

### POST /api/auth/login
Login with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "rt_xyz789",
    "expiresIn": 900,
    "user": {
      "id": "user_abc123",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe"
    }
  }
}
```

---

### POST /api/auth/refresh
Refresh access token using refresh token.

**Request:**
```json
{
  "refreshToken": "rt_xyz789"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 900
  }
}
```

---

### POST /api/auth/logout
Logout and invalidate tokens.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## Contacts API

### GET /api/v1/contacts
List all contacts with pagination and filtering.

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `page` (integer, default: 1) - Page number
- `limit` (integer, default: 20, max: 100) - Items per page
- `search` (string) - Search query (name, email, company)
- `lifecycleStage` (string) - Filter by stage: lead, customer, vip
- `minLeadScore` (integer) - Minimum lead score (0-100)
- `sortBy` (string) - Sort field: createdAt, leadScore, lastName
- `sortOrder` (string) - asc or desc

**Request:**
```
GET /api/v1/contacts?page=1&limit=20&lifecycleStage=lead&minLeadScore=70
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "contacts": [
      {
        "id": "contact_abc123",
        "email": "john.doe@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "company": "Acme Corp",
        "phone": "+1234567890",
        "leadScore": 85,
        "lifecycleStage": "lead",
        "consentMarketing": true,
        "consentProfiling": true,
        "createdAt": "2025-10-01T10:00:00Z",
        "updatedAt": "2025-10-22T15:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```

---

### POST /api/v1/contacts
Create a new contact.

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request:**
```json
{
  "email": "jane.smith@example.com",
  "firstName": "Jane",
  "lastName": "Smith",
  "company": "Tech Startup Inc",
  "phone": "+1987654321",
  "consentMarketing": true,
  "consentProfiling": false,
  "customFields": {
    "industry": "Technology",
    "employees": "50-100",
    "revenue": "$1M-$5M"
  }
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "contact_xyz789",
    "email": "jane.smith@example.com",
    "firstName": "Jane",
    "lastName": "Smith",
    "company": "Tech Startup Inc",
    "phone": "+1987654321",
    "leadScore": 0,
    "lifecycleStage": "lead",
    "consentMarketing": true,
    "consentProfiling": false,
    "consentTimestamp": "2025-10-22T15:45:00Z",
    "customFields": {
      "industry": "Technology",
      "employees": "50-100",
      "revenue": "$1M-$5M"
    },
    "createdAt": "2025-10-22T15:45:00Z",
    "updatedAt": "2025-10-22T15:45:00Z"
  }
}
```

---

### GET /api/v1/contacts/:id
Get a single contact by ID.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "contact_abc123",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "company": "Acme Corp",
    "phone": "+1234567890",
    "leadScore": 85,
    "lifecycleStage": "lead",
    "consentMarketing": true,
    "consentProfiling": true,
    "consentTimestamp": "2025-09-15T10:00:00Z",
    "customFields": {},
    "createdAt": "2025-10-01T10:00:00Z",
    "updatedAt": "2025-10-22T15:30:00Z",
    "stats": {
      "totalInteractions": 12,
      "lastInteractionDate": "2025-10-20T14:00:00Z",
      "totalDeals": 2,
      "totalRevenue": 15000
    }
  }
}
```

---

### PUT /api/v1/contacts/:id
Update a contact.

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request:**
```json
{
  "phone": "+1234567899",
  "lifecycleStage": "customer",
  "customFields": {
    "industry": "Technology",
    "employees": "100-200"
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "contact_abc123",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "company": "Acme Corp",
    "phone": "+1234567899",
    "leadScore": 85,
    "lifecycleStage": "customer",
    "updatedAt": "2025-10-22T16:00:00Z"
  }
}
```

---

### DELETE /api/v1/contacts/:id
Delete a contact (GDPR-compliant soft delete).

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Contact deleted successfully",
  "data": {
    "id": "contact_abc123",
    "deletedAt": "2025-10-22T16:10:00Z"
  }
}
```

---

### GET /api/v1/contacts/:id/export
Export all contact data (GDPR right to data portability).

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "contact": {
      "id": "contact_abc123",
      "email": "john.doe@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "company": "Acme Corp",
      "phone": "+1234567890",
      "createdAt": "2025-10-01T10:00:00Z"
    },
    "interactions": [...],
    "deals": [...],
    "consentHistory": [...],
    "accessLogs": [...],
    "exportedAt": "2025-10-22T16:15:00Z"
  }
}
```

---

## Deals API

### GET /api/v1/deals
List all deals.

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `page` (integer)
- `limit` (integer)
- `contactId` (string) - Filter by contact
- `stage` (string) - Filter by stage
- `minValue` (number) - Minimum deal value
- `sortBy` (string)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "deals": [
      {
        "id": "deal_abc123",
        "contactId": "contact_abc123",
        "title": "Website Redesign Project",
        "value": 25000,
        "currency": "EUR",
        "stage": "proposal",
        "probability": 60,
        "expectedCloseDate": "2025-11-15",
        "createdAt": "2025-10-05T10:00:00Z",
        "updatedAt": "2025-10-20T15:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    }
  }
}
```

---

### POST /api/v1/deals
Create a new deal.

**Request:**
```json
{
  "contactId": "contact_abc123",
  "title": "Website Redesign Project",
  "value": 25000,
  "currency": "EUR",
  "stage": "proposal",
  "expectedCloseDate": "2025-11-15",
  "customFields": {
    "projectType": "website",
    "duration": "3 months"
  }
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "deal_xyz789",
    "contactId": "contact_abc123",
    "title": "Website Redesign Project",
    "value": 25000,
    "currency": "EUR",
    "stage": "proposal",
    "probability": 30,
    "expectedCloseDate": "2025-11-15",
    "createdAt": "2025-10-22T16:30:00Z"
  }
}
```

---

### PUT /api/v1/deals/:id
Update a deal (e.g., move to next stage).

**Request:**
```json
{
  "stage": "negotiation",
  "probability": 70,
  "value": 27500
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "deal_xyz789",
    "stage": "negotiation",
    "probability": 70,
    "value": 27500,
    "updatedAt": "2025-10-22T17:00:00Z"
  }
}
```

---

## Interactions API

### POST /api/v1/interactions
Log a new interaction.

**Request:**
```json
{
  "contactId": "contact_abc123",
  "type": "email",
  "direction": "outbound",
  "subject": "Follow-up on proposal",
  "content": "Hi John, just following up on the proposal we sent last week...",
  "metadata": {
    "emailId": "msg_123",
    "threadId": "thread_456"
  }
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "interaction_abc123",
    "contactId": "contact_abc123",
    "type": "email",
    "direction": "outbound",
    "subject": "Follow-up on proposal",
    "createdAt": "2025-10-22T17:15:00Z"
  }
}
```

---

### GET /api/v1/contacts/:contactId/interactions
Get all interactions for a contact.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "interactions": [
      {
        "id": "interaction_abc123",
        "type": "email",
        "direction": "outbound",
        "subject": "Follow-up on proposal",
        "createdAt": "2025-10-22T17:15:00Z"
      },
      {
        "id": "interaction_abc124",
        "type": "call",
        "direction": "inbound",
        "duration": 1200,
        "createdAt": "2025-10-21T14:30:00Z"
      }
    ]
  }
}
```

---

## Workflows API

### GET /api/v1/workflows
List all available workflows.

**Query Parameters:**
- `category` (string) - Filter by category
- `enabled` (boolean) - Filter by enabled status

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "workflows": [
      {
        "id": "workflow_001",
        "name": "Lead Qualification & Scoring",
        "description": "AI analyzes lead data and assigns score 0-100",
        "category": "sales",
        "enabled": true,
        "triggerType": "contact_created",
        "runCount": 245,
        "lastRun": "2025-10-22T17:00:00Z",
        "avgExecutionTime": 1200
      }
    ]
  }
}
```

---

### POST /api/v1/workflows/:id/execute
Manually trigger a workflow.

**Request:**
```json
{
  "input": {
    "contactId": "contact_abc123"
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "executionId": "exec_xyz789",
    "status": "running",
    "startedAt": "2025-10-22T17:30:00Z"
  }
}
```

---

### GET /api/v1/workflows/executions/:executionId
Get workflow execution status.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "executionId": "exec_xyz789",
    "workflowId": "workflow_001",
    "status": "completed",
    "startedAt": "2025-10-22T17:30:00Z",
    "completedAt": "2025-10-22T17:30:05Z",
    "duration": 5000,
    "output": {
      "leadScore": 85,
      "reasoning": "High engagement, qualified budget, decision maker identified"
    }
  }
}
```

---

## AI Agents API

### POST /api/v1/agents/chat
Chat with AI agent.

**Request:**
```json
{
  "message": "Show me all high-value leads from last week",
  "context": {
    "conversationId": "conv_123"
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "response": "I found 12 high-value leads (score >70) from last week. Here they are:",
    "results": [
      {
        "id": "contact_abc123",
        "name": "John Doe",
        "leadScore": 85,
        "company": "Acme Corp"
      }
    ],
    "conversationId": "conv_123",
    "agentUsed": "sales_agent"
  }
}
```

---

### POST /api/v1/agents/lead-score
AI lead scoring.

**Request:**
```json
{
  "contactId": "contact_abc123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "contactId": "contact_abc123",
    "leadScore": 85,
    "previousScore": 72,
    "reasoning": "Recent high-value interaction, decision maker identified, qualified budget confirmed",
    "recommendations": [
      "Schedule demo call within 48 hours",
      "Send personalized proposal",
      "Add to high-priority pipeline"
    ],
    "scoredAt": "2025-10-22T17:45:00Z"
  }
}
```

---

### POST /api/v1/agents/email-generate
AI email generation.

**Request:**
```json
{
  "contactId": "contact_abc123",
  "emailType": "abandoned_cart",
  "context": {
    "cartValue": 250,
    "products": ["Product A", "Product B"]
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "subject": "Complete your order - 10% discount inside!",
    "body": "Hi John,\n\nI noticed you left some items in your cart...",
    "cta": "Complete your purchase",
    "discountCode": "COMEBACK10",
    "personalization": {
      "tone": "friendly",
      "urgency": "medium"
    }
  }
}
```

---

## Analytics API

### GET /api/v1/analytics/dashboard
Get dashboard KPIs.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "contacts": {
      "total": 1250,
      "newThisMonth": 85,
      "changePercent": 12.5
    },
    "deals": {
      "total": 45,
      "value": 525000,
      "avgValue": 11666,
      "changePercent": 8.3
    },
    "leadScore": {
      "average": 62,
      "high": 127,
      "medium": 856,
      "low": 267
    },
    "revenue": {
      "thisMonth": 125000,
      "lastMonth": 98000,
      "changePercent": 27.5
    }
  }
}
```

---

### GET /api/v1/analytics/reports/sales
Sales performance report.

**Query Parameters:**
- `startDate` (ISO date)
- `endDate` (ISO date)
- `groupBy` (string) - day, week, month

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "period": {
      "start": "2025-10-01",
      "end": "2025-10-22"
    },
    "metrics": {
      "totalRevenue": 275000,
      "dealsWon": 18,
      "dealsLost": 5,
      "winRate": 78.3,
      "avgDealSize": 15277,
      "avgSalesCycle": 28
    },
    "timeline": [
      {
        "date": "2025-10-01",
        "revenue": 12500,
        "deals": 1
      }
    ]
  }
}
```

---

## Webhooks API

### POST /api/v1/webhooks
Register a new webhook.

**Request:**
```json
{
  "url": "https://your-server.com/webhook",
  "events": ["contact.created", "deal.updated", "workflow.completed"],
  "secret": "webhook_secret_key"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "webhook_abc123",
    "url": "https://your-server.com/webhook",
    "events": ["contact.created", "deal.updated", "workflow.completed"],
    "secret": "webhook_secret_key",
    "createdAt": "2025-10-22T18:00:00Z"
  }
}
```

---

### Webhook Payload Format

When an event occurs, we'll send a POST request to your webhook URL:

```json
{
  "id": "event_xyz789",
  "type": "contact.created",
  "timestamp": "2025-10-22T18:05:00Z",
  "data": {
    "contactId": "contact_abc123",
    "email": "new.user@example.com",
    "firstName": "New",
    "lastName": "User"
  },
  "signature": "sha256=abc123..."
}
```

**Verify signature:**
```javascript
const crypto = require('crypto');
const signature = crypto
  .createHmac('sha256', webhookSecret)
  .update(JSON.stringify(payload))
  .digest('hex');
```

---

## Error Handling

### Error Response Format

All errors follow this structure:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is required",
    "details": {
      "field": "email",
      "constraint": "required"
    }
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource already exists |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

### Rate Limiting

Rate limits are applied per user:
- **Anonymous**: 10 requests/minute
- **Authenticated**: 100 requests/minute
- **Premium**: 1000 requests/minute

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1698012345
```

---

## Pagination

All list endpoints support pagination:

**Query Parameters:**
- `page` (integer, default: 1)
- `limit` (integer, default: 20, max: 100)

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

---

## Versioning

API version is included in the URL: `/api/v1/`

When we release breaking changes, we'll increment the version (v2, v3, etc.).

**Support policy:**
- Current version: Fully supported
- Previous version: Supported for 12 months
- Older versions: Deprecated, no support

---

## SDK Examples

### JavaScript/TypeScript

```typescript
import { CRMClient } from '@supersynergy/sdk';

const client = new CRMClient({
  apiKey: 'your_api_key',
  baseURL: 'http://localhost:3000/api/v1'
});

// Create contact
const contact = await client.contacts.create({
  email: 'john@example.com',
  firstName: 'John',
  lastName: 'Doe'
});

// Get lead score
const score = await client.agents.scoreLead(contact.id);
console.log(`Lead score: ${score.leadScore}`);
```

### Python

```python
from supersynergy import CRMClient

client = CRMClient(api_key='your_api_key')

# Create contact
contact = client.contacts.create(
    email='john@example.com',
    first_name='John',
    last_name='Doe'
)

# Get lead score
score = client.agents.score_lead(contact.id)
print(f"Lead score: {score.lead_score}")
```

---

**API Version**: 1.0
**Last Updated**: October 2025
**Status**: Draft - Subject to change
