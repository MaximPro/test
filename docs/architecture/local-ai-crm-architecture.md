# Local AI Agent CRM Architecture
## DSGVO-Compliant CRM for Commerce.js E-commerce Platform

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture Principles](#architecture-principles)
3. [System Architecture](#system-architecture)
4. [Tech Stack](#tech-stack)
5. [Data Flow](#data-flow)
6. [AI Agent Architecture](#ai-agent-architecture)
7. [Integration with Commerce.js](#integration-with-commercejs)
8. [DSGVO Compliance](#dsgvo-compliance)
9. [Security](#security)
10. [Deployment](#deployment)

---

## Overview

This document outlines the architecture for integrating a Local AI Agent CRM system with the existing Commerce.js + Next.js e-commerce platform. The system is designed with DSGVO compliance as a first-class requirement, ensuring all customer data remains within EU jurisdictions and under complete control.

### Key Objectives

- **DSGVO Compliance**: 100% compliant by architectural design
- **Data Sovereignty**: All data stored in EU servers
- **AI Privacy**: Local LLM processing, no data sent to US services
- **Scalability**: Handle growth from 100 to 100,000 customers
- **Cost Efficiency**: €50-100/month operational costs
- **Integration**: Seamless integration with existing Commerce.js store

---

## Architecture Principles

### 1. Privacy by Design
- All customer data stored in EU (Hetzner, Germany)
- Local AI processing (no external API calls)
- Explicit consent tracking for all data usage
- Right to deletion implemented at database level

### 2. Modularity
- Microservices architecture for independent scaling
- Clear separation between CRM, AI, and automation layers
- Plugin-based integration system

### 3. Open Source First
- All components based on open-source software
- No vendor lock-in
- Full code ownership and control

### 4. API-First Design
- RESTful APIs for all operations
- GraphQL for complex queries
- WebSocket for real-time updates

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         SYSTEM ARCHITECTURE                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    PRESENTATION LAYER                            │  │
│  │  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐   │  │
│  │  │  Next.js       │  │  CRM Admin     │  │  Customer      │   │  │
│  │  │  E-commerce    │  │  Dashboard     │  │  Portal        │   │  │
│  │  │  (Existing)    │  │  (New)         │  │  (New)         │   │  │
│  │  └────────────────┘  └────────────────┘  └────────────────┘   │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                            ↓         ↓         ↓                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                       API GATEWAY LAYER                          │  │
│  │  ┌────────────────────────────────────────────────────────────┐ │  │
│  │  │  Next.js API Routes (Existing + Extended)                  │ │  │
│  │  │  ├─ /api/commerce/* (Commerce.js passthrough)             │ │  │
│  │  │  ├─ /api/crm/* (CRM operations)                           │ │  │
│  │  │  ├─ /api/ai/* (AI agent operations)                       │ │  │
│  │  │  └─ /api/automation/* (Workflow triggers)                 │ │  │
│  │  └────────────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                            ↓         ↓         ↓                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    APPLICATION LAYER                             │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌──────────┐  │  │
│  │  │   CRM      │  │   AI       │  │ Automation │  │ Analytics│  │  │
│  │  │  Service   │  │  Agents    │  │  Engine    │  │  Service │  │  │
│  │  │            │  │            │  │            │  │          │  │  │
│  │  │ FastAPI    │  │ LangChain  │  │   n8n      │  │ Custom   │  │  │
│  │  │ (Python)   │  │ + CrewAI   │  │ (Node.js)  │  │ (Python) │  │  │
│  │  └────────────┘  └────────────┘  └────────────┘  └──────────┘  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                            ↓         ↓         ↓                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                      DATA LAYER                                  │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌──────────┐  │  │
│  │  │ PostgreSQL │  │   Redis    │  │  Vector DB │  │  S3/Minio│  │  │
│  │  │            │  │            │  │            │  │          │  │  │
│  │  │ Primary DB │  │   Cache    │  │ AI Memory  │  │ Files    │  │  │
│  │  │ (Contacts, │  │   Session  │  │ (Embeddings│  │ (Exports)│  │  │
│  │  │  Orders)   │  │   Queue    │  │  RAG)      │  │          │  │  │
│  │  └────────────┘  └────────────┘  └────────────┘  └──────────┘  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                            ↓         ↓                                  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    AI INFERENCE LAYER                            │  │
│  │  ┌────────────────────────────────────────────────────────────┐ │  │
│  │  │  Ollama (Local LLM)                                        │ │  │
│  │  │  ├─ LLaMA2-13B/70B (General purpose)                      │ │  │
│  │  │  ├─ Code Llama (Technical support)                        │ │  │
│  │  │  └─ Mistral (Fast responses)                              │ │  │
│  │  └────────────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    INFRASTRUCTURE LAYER                          │  │
│  │  ┌────────────────────────────────────────────────────────────┐ │  │
│  │  │  Docker Compose / Kubernetes                               │ │  │
│  │  │  ├─ Container orchestration                                │ │  │
│  │  │  ├─ Service discovery                                      │ │  │
│  │  │  ├─ Health checks                                          │ │  │
│  │  │  └─ Auto-scaling                                           │ │  │
│  │  └────────────────────────────────────────────────────────────┘ │  │
│  │                                                                  │  │
│  │  ┌────────────────────────────────────────────────────────────┐ │  │
│  │  │  Hetzner Cloud (Germany)                                   │ │  │
│  │  │  ├─ CPX51 (16 vCPU, 32GB RAM) - €35/month                │ │  │
│  │  │  ├─ 500GB SSD Storage                                      │ │  │
│  │  │  ├─ Automated backups                                      │ │  │
│  │  │  └─ EU data residency guaranteed                          │ │  │
│  │  └────────────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

### Frontend
```yaml
Framework: Next.js 14+ (existing)
UI Library: React 18+
State Management: Redux (existing) + Zustand (new CRM state)
Styling: SASS/SCSS + Tailwind CSS
Forms: React Hook Form + Zod validation
Charts: Recharts / Chart.js
Real-time: Socket.io-client
```

### Backend Services

#### CRM Service (FastAPI)
```yaml
Language: Python 3.11+
Framework: FastAPI 0.104+
ORM: SQLAlchemy 2.0+
Validation: Pydantic v2
Authentication: JWT + OAuth2
Rate Limiting: SlowAPI
Background Tasks: Celery + Redis
```

#### AI Agent Service (LangChain)
```yaml
Language: Python 3.11+
Framework: LangChain 0.1+
Agent Orchestration: CrewAI
LLM: Ollama (LLaMA2-13B/70B)
Vector Store: ChromaDB
Embeddings: sentence-transformers (local)
Memory: Redis + PostgreSQL
```

#### Automation Engine (n8n)
```yaml
Platform: n8n (self-hosted)
Runtime: Node.js 18+
Database: PostgreSQL
Queue: Bull (Redis-based)
Workflows: Visual + Code-based
Integrations: 400+ pre-built
```

### Databases

#### Primary Database (PostgreSQL)
```yaml
Version: PostgreSQL 16
Extensions:
  - pgcrypto (encryption)
  - pg_trgm (fuzzy search)
  - uuid-ossp (UUID generation)
Backup: Automated 3x daily
Replication: Master-slave setup
```

#### Cache & Queue (Redis)
```yaml
Version: Redis 7+
Persistence: RDB + AOF
Use cases:
  - Session storage
  - Rate limiting
  - Background job queue
  - Real-time data cache
```

#### Vector Database (ChromaDB)
```yaml
Purpose: AI embeddings & semantic search
Storage: Local file system + PostgreSQL
Use cases:
  - Customer support knowledge base
  - Product recommendations
  - Semantic search
```

### AI Infrastructure

#### LLM Runtime (Ollama)
```yaml
Models:
  - LLaMA2-13B: Fast responses (4GB VRAM)
  - LLaMA2-70B: Best quality (40GB VRAM)
  - Mistral-7B: Ultra-fast (4GB VRAM)
  - Code Llama: Technical support
Hardware Requirements:
  - CPU: 16+ cores
  - RAM: 32GB+
  - GPU: Optional (NVIDIA RTX 3090/4090)
  - Storage: 100GB for models
```

### DevOps

```yaml
Containerization: Docker + Docker Compose
Orchestration: Docker Swarm (simple) or K8s (advanced)
CI/CD: GitHub Actions
Monitoring: Prometheus + Grafana
Logging: ELK Stack (Elasticsearch, Logstash, Kibana)
Alerting: Alertmanager
Backup: Restic + S3-compatible storage
```

---

## Data Flow

### Customer Journey Data Flow

```
┌────────────────────────────────────────────────────────────────────────┐
│                      CUSTOMER JOURNEY DATA FLOW                         │
└────────────────────────────────────────────────────────────────────────┘

1. CUSTOMER VISITS STORE
   ↓
   Next.js Page Load
   ├─ Anonymous tracking (consent required)
   ├─ Session ID created
   └─ Redis session storage

2. CUSTOMER BROWSES PRODUCTS
   ↓
   Commerce.js API
   ├─ Product views tracked
   ├─ Category interests logged
   └─ Stored in PostgreSQL (crm.interactions table)

3. CUSTOMER ADDS TO CART
   ↓
   Commerce.js Cart API + CRM Service
   ├─ Cart event logged
   ├─ AI Lead Scoring triggered
   │  └─ Ollama LLM analyzes:
   │     - Cart value
   │     - Product categories
   │     - Browsing behavior
   │     - Time on site
   │  └─ Score: 0-100 stored in crm.leads
   └─ If score > 70: Trigger automation
      └─ n8n workflow: Send personalized email

4. CUSTOMER STARTS CHECKOUT
   ↓
   Commerce.js Checkout API + CRM Service
   ├─ Checkout started event
   ├─ Email collected (with DSGVO consent)
   ├─ Contact created/updated in crm.contacts
   └─ AI Email Agent generates personalized follow-up
      └─ Template: "Hi {name}, we noticed you're checking out..."

5. CHECKOUT ABANDONED
   ↓
   n8n Workflow Triggered (15 min delay)
   ├─ AI Agent analyzes abandonment reason
   ├─ Generate recovery email
   │  └─ Personalized discount code
   │  └─ Product recommendations
   └─ Schedule 3-email sequence:
      - Email 1: 1 hour later (10% discount)
      - Email 2: 24 hours later (15% discount)
      - Email 3: 3 days later (20% discount + social proof)

6. PURCHASE COMPLETED
   ↓
   Commerce.js Order Webhook + CRM Service
   ├─ Order synced to crm.orders
   ├─ Customer lifecycle stage updated: "Customer"
   ├─ AI Agent generates:
   │  ├─ Thank you email
   │  ├─ Order summary
   │  └─ Personalized upsell recommendations
   └─ n8n Workflow:
      ├─ Send order confirmation
      ├─ Add to "Recent Customers" segment
      └─ Schedule follow-up email (7 days post-delivery)

7. POST-PURCHASE ENGAGEMENT
   ↓
   n8n Workflow (7 days after delivery)
   ├─ AI Agent generates review request
   ├─ Email sent with review link
   └─ If review received:
      ├─ Thank you email
      ├─ Loyalty points added
      └─ Segment: "Brand Advocates"

8. ONGOING RELATIONSHIP
   ↓
   CRM AI Agent (Weekly analysis)
   ├─ Customer segmentation
   │  └─ RFM analysis (Recency, Frequency, Monetary)
   ├─ Churn risk prediction
   └─ Personalized campaign triggers
      ├─ Win-back campaigns (inactive customers)
      ├─ VIP rewards (high-value customers)
      └─ Re-engagement (dormant customers)
```

### DSGVO Compliant Data Processing

```
┌────────────────────────────────────────────────────────────────────────┐
│                  DSGVO DATA PROCESSING FLOWCHART                        │
└────────────────────────────────────────────────────────────────────────┘

Every data operation follows this flow:

1. DATA COLLECTION REQUEST
   ↓
   ┌─────────────────────────┐
   │ Consent Check          │
   │ ├─ Has consent? ─────→ YES → Continue
   │ └─ No consent? ──────→ NO  → Show consent form
   └─────────────────────────┘

2. CONSENT GRANTED
   ↓
   ┌─────────────────────────┐
   │ Log Consent            │
   │ ├─ Timestamp           │
   │ ├─ IP address          │
   │ ├─ Consent type        │
   │ └─ Store in:           │
   │    crm.consent_logs    │
   └─────────────────────────┘

3. DATA PROCESSING
   ↓
   ┌─────────────────────────┐
   │ Process Data           │
   │ ├─ Encrypt PII         │
   │ ├─ Log access          │
   │ └─ Audit trail         │
   └─────────────────────────┘

4. DATA RETENTION
   ↓
   ┌─────────────────────────┐
   │ Retention Policy       │
   │ ├─ Active customers:   │
   │ │  Keep while active   │
   │ ├─ Inactive:           │
   │ │  Delete after 3 years│
   │ └─ Automated cleanup   │
   │    (cron job daily)    │
   └─────────────────────────┘

5. DATA DELETION REQUEST
   ↓
   ┌─────────────────────────┐
   │ Right to Deletion      │
   │ ├─ Verify identity     │
   │ ├─ Legal hold check    │
   │ ├─ Delete from:        │
   │ │  ├─ PostgreSQL       │
   │ │  ├─ Redis            │
   │ │  ├─ Vector DB        │
   │ │  └─ Backups (marked) │
   │ └─ Confirmation email  │
   └─────────────────────────┘
```

---

## AI Agent Architecture

### Multi-Agent System

```
┌────────────────────────────────────────────────────────────────────────┐
│                     AI AGENT ARCHITECTURE                               │
└────────────────────────────────────────────────────────────────────────┘

                        ┌──────────────────┐
                        │  Agent Manager   │
                        │  (CrewAI)        │
                        └────────┬─────────┘
                                 │
                    ┌────────────┼────────────┐
                    │            │            │
          ┌─────────▼────┐  ┌───▼─────┐  ┌──▼──────────┐
          │ Sales Agent  │  │Support  │  │Marketing    │
          │              │  │Agent    │  │Agent        │
          └──────────────┘  └─────────┘  └─────────────┘
                 │               │              │
        ┌────────┼───────┐      │      ┌───────┼────────┐
        │        │       │      │      │       │        │
   ┌────▼───┐ ┌─▼────┐ ┌▼──────▼──┐ ┌─▼────┐ ┌▼─────┐ ┌▼────┐
   │Lead    │ │Email │ │Chat      │ │Ticket│ │Email │ │Content│
   │Scoring │ │Gen   │ │Assistant │ │Triage│ │Gen   │ │Gen    │
   └────────┘ └──────┘ └──────────┘ └──────┘ └──────┘ └───────┘
```

### Agent Specifications

#### 1. Sales Agent
```yaml
Purpose: Lead qualification, scoring, and conversion
Capabilities:
  - Lead scoring (0-100)
  - Sales email generation
  - Product recommendations
  - Upsell/cross-sell suggestions
  - Cart abandonment recovery
LLM: LLaMA2-13B
Memory: Redis + PostgreSQL
Response Time: <500ms
```

#### 2. Support Agent
```yaml
Purpose: Customer support and issue resolution
Capabilities:
  - Ticket triage and categorization
  - Automated responses (FAQs)
  - Sentiment analysis
  - Escalation detection
  - Multi-language support
LLM: LLaMA2-70B (higher quality)
Knowledge Base: ChromaDB (RAG)
Response Time: <1000ms
```

#### 3. Marketing Agent
```yaml
Purpose: Campaign planning and content generation
Capabilities:
  - Email campaign generation
  - Subject line optimization
  - A/B test suggestions
  - Segment recommendations
  - Content personalization
LLM: LLaMA2-13B + Mistral
Creativity: High temperature (0.8)
Response Time: <2000ms (non-critical)
```

### Agent Communication Protocol

```python
# Example: Agent task routing
class AgentManager:
    def route_task(self, task: Task) -> Agent:
        """Route task to appropriate agent"""
        if task.type == "lead_scoring":
            return self.sales_agent
        elif task.type == "support_ticket":
            return self.support_agent
        elif task.type == "email_generation":
            return self.marketing_agent
        else:
            return self.default_agent

    async def execute_task(self, task: Task) -> Result:
        """Execute task with appropriate agent"""
        agent = self.route_task(task)
        result = await agent.execute(task)

        # Log for DSGVO audit trail
        await self.log_agent_action(
            agent=agent.name,
            task=task.id,
            result=result.summary,
            timestamp=datetime.utcnow()
        )

        return result
```

---

## Integration with Commerce.js

### Webhook Integration

```javascript
// pages/api/webhooks/commercejs.js
import { handleCommerceWebhook } from '@/lib/crm/webhooks'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const signature = req.headers['x-chec-signature']
  const event = req.body

  // Verify webhook signature
  if (!verifySignature(signature, event)) {
    return res.status(401).json({ error: 'Invalid signature' })
  }

  // Route to CRM service
  switch (event.type) {
    case 'order.created':
      await handleOrderCreated(event.payload)
      break
    case 'cart.abandoned':
      await handleCartAbandoned(event.payload)
      break
    case 'customer.created':
      await handleCustomerCreated(event.payload)
      break
    default:
      console.log(`Unhandled event: ${event.type}`)
  }

  res.status(200).json({ received: true })
}

async function handleOrderCreated(order) {
  // Send to CRM service
  await fetch('http://crm-service:8000/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      order_id: order.id,
      customer_email: order.customer.email,
      total: order.order_value.raw,
      items: order.order.line_items,
      created_at: order.created
    })
  })

  // Trigger AI agent for post-purchase email
  await fetch('http://ai-service:8001/api/agents/sales/post-purchase', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customer_email: order.customer.email,
      order_id: order.id
    })
  })
}
```

### Data Sync Strategy

```
Commerce.js (Source of Truth)     →     Local CRM (Analytics & AI)
─────────────────────────────────────────────────────────────────────
Orders                            →     crm.orders (synced)
Customers                         →     crm.contacts (enriched)
Products                          →     crm.products (cached)
Cart Events                       →     crm.interactions (tracked)
```

**Sync Frequency:**
- Orders: Real-time (webhooks)
- Customers: Real-time (webhooks)
- Products: Every 6 hours (scheduled)
- Analytics: Daily aggregation

---

## DSGVO Compliance

### Database Schema (DSGVO-Compliant)

```sql
-- Contacts table with encryption
CREATE TABLE crm.contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    email_encrypted BYTEA, -- Encrypted with pgcrypto
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(50),
    phone_encrypted BYTEA,

    -- DSGVO fields
    consent_marketing BOOLEAN DEFAULT FALSE,
    consent_profiling BOOLEAN DEFAULT FALSE,
    consent_timestamp TIMESTAMP WITH TIME ZONE,
    consent_ip_address INET,

    -- Lifecycle
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE, -- Soft delete

    -- Metadata
    source VARCHAR(50), -- 'ecommerce', 'manual', 'import'
    lifecycle_stage VARCHAR(50), -- 'lead', 'customer', 'vip'
    lead_score INTEGER DEFAULT 0,

    INDEX idx_email (email),
    INDEX idx_deleted_at (deleted_at) WHERE deleted_at IS NULL
);

-- Consent log table (immutable audit trail)
CREATE TABLE crm.consent_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contact_id UUID REFERENCES crm.contacts(id),
    consent_type VARCHAR(50) NOT NULL, -- 'marketing', 'profiling', etc.
    consent_given BOOLEAN NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    method VARCHAR(50), -- 'form', 'api', 'import'

    -- Immutable: No updates or deletes allowed
    INDEX idx_contact_consent (contact_id, consent_type, timestamp DESC)
);

-- Data access log (DSGVO Article 15)
CREATE TABLE crm.data_access_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contact_id UUID REFERENCES crm.contacts(id),
    accessed_by UUID, -- Staff user ID
    access_type VARCHAR(50), -- 'view', 'edit', 'export', 'delete'
    accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    purpose TEXT, -- Reason for access

    INDEX idx_contact_access (contact_id, accessed_at DESC)
);

-- Data deletion requests (DSGVO Article 17)
CREATE TABLE crm.deletion_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contact_id UUID REFERENCES crm.contacts(id),
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    requested_by VARCHAR(255), -- Email or user ID
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'completed'
    completed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,

    INDEX idx_status (status, requested_at)
);
```

### DSGVO Rights Implementation

#### Right to Access (Article 15)
```python
# GET /api/crm/contacts/{id}/data-export
async def export_customer_data(contact_id: UUID):
    """Export all data for a customer"""
    data = {
        "personal_info": await get_contact(contact_id),
        "orders": await get_orders(contact_id),
        "interactions": await get_interactions(contact_id),
        "consent_history": await get_consent_logs(contact_id),
        "access_logs": await get_access_logs(contact_id),
    }

    # Log access for audit trail
    await log_data_access(
        contact_id=contact_id,
        access_type="export",
        purpose="Customer data export request"
    )

    return JSONResponse(data)
```

#### Right to Deletion (Article 17)
```python
# DELETE /api/crm/contacts/{id}
async def delete_customer_data(contact_id: UUID, request: DeletionRequest):
    """Delete all customer data (with legal hold check)"""

    # Check for legal holds (e.g., tax requirements)
    if await has_legal_hold(contact_id):
        raise HTTPException(
            status_code=403,
            detail="Cannot delete: Legal hold active (tax records retention)"
        )

    # Create deletion request
    deletion_request = await create_deletion_request(
        contact_id=contact_id,
        requested_by=request.email
    )

    # Execute deletion (cascade to all related tables)
    await db.execute("""
        UPDATE crm.contacts
        SET
            deleted_at = NOW(),
            email = 'deleted_' || id || '@deleted.local',
            first_name = 'DELETED',
            last_name = 'DELETED',
            phone = NULL,
            email_encrypted = NULL,
            phone_encrypted = NULL
        WHERE id = :contact_id
    """, {"contact_id": contact_id})

    # Mark deletion complete
    await complete_deletion_request(deletion_request.id)

    # Trigger cleanup in other systems
    await trigger_deletion_webhook(contact_id)

    return {"status": "deleted", "request_id": deletion_request.id}
```

#### Right to Portability (Article 20)
```python
# GET /api/crm/contacts/{id}/export
async def export_portable_data(contact_id: UUID):
    """Export data in machine-readable format"""
    data = await get_all_customer_data(contact_id)

    # Format in JSON (structured, commonly used format)
    return JSONResponse(
        content=data,
        headers={
            "Content-Disposition": f"attachment; filename=customer_{contact_id}.json"
        }
    )
```

---

## Security

### Authentication & Authorization

```yaml
Authentication:
  - JWT tokens (15min expiry)
  - Refresh tokens (7 day expiry)
  - OAuth2 for third-party integrations

Authorization:
  - Role-Based Access Control (RBAC)
  - Roles:
    - admin: Full access
    - manager: Read/write CRM data
    - staff: Read-only CRM data
    - customer: Own data only

  - Permission matrix stored in PostgreSQL
  - Middleware enforces permissions on every request
```

### Data Encryption

```yaml
At Rest:
  - Database: PostgreSQL pgcrypto
  - Files: AES-256 encryption
  - Backups: GPG encrypted

In Transit:
  - HTTPS/TLS 1.3 only
  - HSTS enabled
  - Certificate pinning for API clients

PII Encryption:
  - Email: Encrypted in database
  - Phone: Encrypted in database
  - Addresses: Encrypted in database
  - Encryption key stored in KMS (Vault)
```

### Rate Limiting

```yaml
Global:
  - 100 requests/minute per IP
  - 1000 requests/hour per IP

API Endpoints:
  - Auth: 5 requests/minute (prevent brute force)
  - CRM: 60 requests/minute
  - AI: 10 requests/minute (expensive operations)

Implementation: Redis-based sliding window
```

---

## Deployment

### Docker Compose (Development)

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: crm
      POSTGRES_USER: crm_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"

  crm-service:
    build: ./services/crm
    depends_on:
      - postgres
      - redis
    environment:
      DATABASE_URL: postgresql://crm_user:${DB_PASSWORD}@postgres/crm
      REDIS_URL: redis://redis:6379/0
    ports:
      - "8000:8000"

  ai-service:
    build: ./services/ai
    depends_on:
      - postgres
      - redis
    environment:
      OLLAMA_HOST: http://ollama:11434
    ports:
      - "8001:8001"

  ollama:
    image: ollama/ollama:latest
    volumes:
      - ollama_data:/root/.ollama
    ports:
      - "11434:11434"

  n8n:
    image: n8nio/n8n:latest
    depends_on:
      - postgres
    environment:
      DB_TYPE: postgresdb
      DB_POSTGRESDB_HOST: postgres
      DB_POSTGRESDB_DATABASE: n8n
      DB_POSTGRESDB_USER: n8n_user
      DB_POSTGRESDB_PASSWORD: ${N8N_PASSWORD}
    volumes:
      - n8n_data:/home/node/.n8n
    ports:
      - "5678:5678"

  nextjs:
    build: .
    depends_on:
      - crm-service
    environment:
      NEXT_PUBLIC_CHEC_PUBLIC_KEY: ${CHEC_PUBLIC_KEY}
      CRM_API_URL: http://crm-service:8000
    ports:
      - "3000:3000"

volumes:
  postgres_data:
  redis_data:
  ollama_data:
  n8n_data:
```

### Production Deployment (Hetzner)

```yaml
Server Specs:
  - Provider: Hetzner Cloud (Germany)
  - Instance: CPX51
  - CPU: 16 vCPU
  - RAM: 32GB
  - Storage: 500GB NVMe SSD
  - Network: 20TB traffic
  - Cost: €35/month

Deployment Strategy:
  - Docker Swarm (simple orchestration)
  - Traefik (reverse proxy + SSL)
  - Automated backups to Hetzner Storage Box
  - Monitoring: Prometheus + Grafana

Security:
  - UFW firewall (only ports 80, 443, 22 open)
  - Fail2ban (brute force protection)
  - Automatic security updates
  - SSH key authentication only
```

---

## Next Steps

1. **Phase 1**: Set up infrastructure (Week 1-2)
   - Provision Hetzner server
   - Configure Docker Swarm
   - Set up monitoring

2. **Phase 2**: Deploy CRM service (Week 3-4)
   - Build FastAPI CRM service
   - Implement DSGVO-compliant database schema
   - Create API endpoints

3. **Phase 3**: Integrate AI agents (Week 5-6)
   - Deploy Ollama + LLaMA2
   - Implement agent framework
   - Connect to CRM service

4. **Phase 4**: Build admin dashboard (Week 7-8)
   - Create React admin UI
   - Implement customer portal
   - Connect to CRM API

5. **Phase 5**: Set up automation (Week 9-10)
   - Deploy n8n
   - Create workflows
   - Test integrations

6. **Phase 6**: Testing & launch (Week 11-12)
   - Security audit
   - Performance testing
   - DSGVO compliance review
   - Go live!

---

**Document Version:** 1.0
**Last Updated:** October 2025
**Author:** Technical Architecture Team
**Status:** Ready for Implementation
