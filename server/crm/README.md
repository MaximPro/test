# CRM Server Module

This module implements the Local AI CRM backend integrated with the existing Commerce.js Next.js demo store.

## Structure

```
server/crm/
├── README.md (this file)
├── routes/
│   ├── contacts.ts        # Contact CRUD endpoints
│   ├── deals.ts           # Deal pipeline endpoints
│   ├── interactions.ts    # Interaction logging
│   ├── workflows.ts       # Workflow management
│   └── analytics.ts       # Analytics & reporting
├── models/
│   ├── Contact.ts         # Contact model (TypeScript interfaces)
│   ├── Deal.ts            # Deal model
│   ├── Interaction.ts     # Interaction model
│   └── Workflow.ts        # Workflow model
├── services/
│   ├── ContactService.ts  # Business logic for contacts
│   ├── DealService.ts     # Business logic for deals
│   ├── AIService.ts       # AI agent integration
│   └── WorkflowService.ts # Workflow execution
└── utils/
    ├── database.ts        # Database connection (PostgreSQL)
    ├── encryption.ts      # AES-256-GCM encryption
    └── validation.ts      # Input validation
```

## Setup

1. Install dependencies:
```bash
npm install pg @types/pg
npm install dotenv
npm install express @types/express
```

2. Set up environment variables in `.env`:
```
DATABASE_URL=postgresql://user:password@localhost:5432/crm
ENCRYPTION_KEY=your-32-byte-encryption-key
```

3. Run database migrations:
```bash
npm run migrate
```

4. Start the server:
```bash
npm run dev
```

## API Endpoints

See `docs/api/API_SPECIFICATION.md` for full API documentation.

### Contacts
- `GET /api/v1/contacts` - List contacts
- `POST /api/v1/contacts` - Create contact
- `GET /api/v1/contacts/:id` - Get contact
- `PUT /api/v1/contacts/:id` - Update contact
- `DELETE /api/v1/contacts/:id` - Delete contact (GDPR-compliant)

### Deals
- `GET /api/v1/deals` - List deals
- `POST /api/v1/deals` - Create deal
- `PUT /api/v1/deals/:id` - Update deal

### Workflows
- `GET /api/v1/workflows` - List workflows
- `POST /api/v1/workflows/:id/execute` - Execute workflow

## Integration with Commerce.js

The CRM automatically syncs data from Commerce.js orders:

```typescript
// When order is created in Commerce.js
order.created → Webhook → Create/update contact in CRM
                        → Log interaction
                        → Trigger lead scoring workflow
```

## GDPR Compliance

All endpoints implement GDPR requirements:
- Consent tracking
- Right to access (data export)
- Right to erasure (soft delete)
- Audit logging

See `docs/compliance/` for details.
