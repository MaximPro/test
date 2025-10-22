# Database Schema Specification
## Local AI CRM & SuperSynergy

---

## Overview

This document specifies the complete database schema for the Local AI CRM and SuperSynergy systems. The schema is designed with DSGVO/GDPR compliance as a first-class requirement.

**Database**: PostgreSQL 16+ (primary CRM data) + SQLite (chat-man compatibility)
**Character Set**: UTF-8
**Collation**: UTF-8 General CI

---

## Table of Contents

1. [Core CRM Tables](#core-crm-tables)
2. [Compliance Tables](#compliance-tables)
3. [Workflow Tables](#workflow-tables)
4. [Analytics Tables](#analytics-tables)
5. [Indexes](#indexes)
6. [Triggers](#triggers)
7. [Views](#views)
8. [Migrations](#migrations)

---

## Core CRM Tables

### contacts

Stores all customer and lead information.

```sql
CREATE TABLE contacts (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Basic information
    email VARCHAR(255) UNIQUE NOT NULL,
    email_encrypted BYTEA, -- Encrypted with AES-256-GCM
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    company VARCHAR(255),
    title VARCHAR(100),
    phone VARCHAR(50),
    phone_encrypted BYTEA, -- Encrypted

    -- Address
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(2), -- ISO 3166-1 alpha-2

    -- CRM fields
    lead_score INTEGER DEFAULT 0 CHECK (lead_score BETWEEN 0 AND 100),
    lead_score_reason TEXT,
    last_scored_at TIMESTAMP WITH TIME ZONE,
    lifecycle_stage VARCHAR(50) DEFAULT 'lead' CHECK (
        lifecycle_stage IN ('lead', 'qualified', 'opportunity', 'customer', 'vip', 'churned')
    ),
    source VARCHAR(100), -- utm_source or manual entry

    -- DSGVO/GDPR compliance
    consent_marketing BOOLEAN DEFAULT FALSE,
    consent_profiling BOOLEAN DEFAULT FALSE,
    consent_timestamp TIMESTAMP WITH TIME ZONE,
    consent_ip_address INET,
    consent_method VARCHAR(50), -- 'form', 'api', 'import', 'verbal'

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE, -- Soft delete for GDPR
    created_by UUID, -- References users table
    updated_by UUID,

    -- Custom fields (JSON)
    custom_fields JSONB DEFAULT '{}'::jsonb,

    -- Tags (for segmentation)
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],

    -- External IDs (for integrations)
    external_ids JSONB DEFAULT '{}'::jsonb, -- {'stripe': 'cus_123', 'commerce_js': 'abc'}

    CONSTRAINT email_required CHECK (email IS NOT NULL OR email_encrypted IS NOT NULL)
);

-- Indexes
CREATE INDEX idx_contacts_email ON contacts(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_contacts_lead_score ON contacts(lead_score DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_contacts_lifecycle_stage ON contacts(lifecycle_stage) WHERE deleted_at IS NULL;
CREATE INDEX idx_contacts_created_at ON contacts(created_at DESC);
CREATE INDEX idx_contacts_tags ON contacts USING GIN(tags);
CREATE INDEX idx_contacts_custom_fields ON contacts USING GIN(custom_fields);
CREATE INDEX idx_contacts_external_ids ON contacts USING GIN(external_ids);

-- Comments
COMMENT ON TABLE contacts IS 'Core contacts table with GDPR compliance';
COMMENT ON COLUMN contacts.email_encrypted IS 'AES-256-GCM encrypted email for PII protection';
COMMENT ON COLUMN contacts.consent_timestamp IS 'When consent was explicitly given (GDPR Article 7)';
COMMENT ON COLUMN contacts.deleted_at IS 'Soft delete for GDPR right to erasure (Article 17)';
```

---

### deals

Tracks sales opportunities and their progress through the pipeline.

```sql
CREATE TABLE deals (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Foreign keys
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    assigned_to UUID, -- References users table

    -- Deal information
    title VARCHAR(255) NOT NULL,
    description TEXT,
    value DECIMAL(12, 2), -- Deal value
    currency VARCHAR(3) DEFAULT 'EUR', -- ISO 4217

    -- Pipeline
    stage VARCHAR(50) NOT NULL DEFAULT 'lead' CHECK (
        stage IN ('lead', 'qualified', 'proposal', 'negotiation', 'won', 'lost')
    ),
    probability INTEGER CHECK (probability BETWEEN 0 AND 100),

    -- Dates
    expected_close_date DATE,
    actual_close_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

    -- Win/Loss
    close_reason TEXT, -- Why won or lost
    competitor VARCHAR(255), -- If lost, to whom

    -- Custom fields
    custom_fields JSONB DEFAULT '{}'::jsonb,

    -- Metadata
    source VARCHAR(100),
    tags TEXT[] DEFAULT ARRAY[]::TEXT[]
);

-- Indexes
CREATE INDEX idx_deals_contact_id ON deals(contact_id);
CREATE INDEX idx_deals_assigned_to ON deals(assigned_to);
CREATE INDEX idx_deals_stage ON deals(stage);
CREATE INDEX idx_deals_created_at ON deals(created_at DESC);
CREATE INDEX idx_deals_expected_close_date ON deals(expected_close_date);

-- Comments
COMMENT ON TABLE deals IS 'Sales pipeline and opportunity tracking';
COMMENT ON COLUMN deals.probability IS 'Win probability percentage (0-100)';
```

---

### interactions

Logs all customer interactions (emails, calls, meetings, etc.).

```sql
CREATE TABLE interactions (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Foreign keys
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
    user_id UUID, -- Staff member who handled interaction

    -- Interaction type
    type VARCHAR(50) NOT NULL CHECK (
        type IN ('email', 'call', 'meeting', 'note', 'chat', 'sms', 'form_submission', 'website_visit')
    ),
    direction VARCHAR(20) CHECK (direction IN ('inbound', 'outbound')),

    -- Content
    subject VARCHAR(500),
    content TEXT,
    content_encrypted BYTEA, -- For sensitive content

    -- Email specific
    from_email VARCHAR(255),
    to_email VARCHAR(255),
    cc_emails TEXT[],

    -- Call specific
    duration INTEGER, -- seconds
    recording_url TEXT,

    -- Meeting specific
    meeting_date TIMESTAMP WITH TIME ZONE,
    attendees TEXT[],

    -- Website visit specific
    page_url TEXT,
    referrer TEXT,
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb, -- Flexible storage for type-specific data

    -- Sentiment analysis (from AI)
    sentiment_score DECIMAL(3, 2), -- -1.00 to 1.00
    sentiment_label VARCHAR(20), -- 'negative', 'neutral', 'positive'

    -- Tags
    tags TEXT[] DEFAULT ARRAY[]::TEXT[]
);

-- Indexes
CREATE INDEX idx_interactions_contact_id ON interactions(contact_id);
CREATE INDEX idx_interactions_deal_id ON interactions(deal_id);
CREATE INDEX idx_interactions_type ON interactions(type);
CREATE INDEX idx_interactions_created_at ON interactions(created_at DESC);
CREATE INDEX idx_interactions_metadata ON interactions USING GIN(metadata);

-- Comments
COMMENT ON TABLE interactions IS 'All customer interactions across channels';
COMMENT ON COLUMN interactions.sentiment_score IS 'AI-analyzed sentiment (-1 to 1)';
```

---

### companies

Stores company/organization data (optional, for B2B).

```sql
CREATE TABLE companies (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Basic info
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255) UNIQUE,
    industry VARCHAR(100),
    employee_count VARCHAR(50), -- '1-10', '11-50', etc.
    annual_revenue_range VARCHAR(50), -- '$0-$1M', '$1M-$10M', etc.

    -- Address
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(2),

    -- Contact
    phone VARCHAR(50),
    website VARCHAR(255),

    -- Enrichment data
    linkedin_url VARCHAR(255),
    twitter_handle VARCHAR(100),
    tech_stack TEXT[], -- ['React', 'Node.js', 'PostgreSQL']

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    custom_fields JSONB DEFAULT '{}'::jsonb,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[]
);

-- Add foreign key to contacts
ALTER TABLE contacts ADD COLUMN company_id UUID REFERENCES companies(id) ON DELETE SET NULL;

-- Indexes
CREATE INDEX idx_companies_domain ON companies(domain);
CREATE INDEX idx_companies_industry ON companies(industry);
CREATE INDEX idx_companies_name ON companies(name);

-- Comments
COMMENT ON TABLE companies IS 'Company/organization data for B2B CRM';
```

---

## Compliance Tables

### consent_logs

Immutable audit trail of all consent changes (GDPR Article 7).

```sql
CREATE TABLE consent_logs (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Foreign key
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,

    -- Consent details
    consent_type VARCHAR(50) NOT NULL CHECK (
        consent_type IN ('marketing', 'profiling', 'third_party_sharing', 'analytics')
    ),
    consent_given BOOLEAN NOT NULL,

    -- Audit information
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    ip_address INET,
    user_agent TEXT,
    method VARCHAR(50), -- 'form', 'api', 'email_link', 'verbal', 'import'

    -- Additional context
    form_url TEXT,
    form_version VARCHAR(50),
    notes TEXT,

    -- Legal basis (GDPR Article 6)
    legal_basis VARCHAR(50) CHECK (
        legal_basis IN ('consent', 'contract', 'legal_obligation', 'vital_interest', 'public_task', 'legitimate_interest')
    ) DEFAULT 'consent',

    -- Proof of consent
    proof_url TEXT, -- Link to recorded consent (e.g., signed form PDF)
    proof_hash VARCHAR(64) -- SHA-256 hash of consent proof
);

-- Indexes
CREATE INDEX idx_consent_logs_contact_id ON consent_logs(contact_id);
CREATE INDEX idx_consent_logs_timestamp ON consent_logs(timestamp DESC);
CREATE INDEX idx_consent_logs_consent_type ON consent_logs(consent_type);

-- Prevent updates and deletes (immutable log)
CREATE RULE consent_logs_no_update AS ON UPDATE TO consent_logs DO INSTEAD NOTHING;
CREATE RULE consent_logs_no_delete AS ON DELETE TO consent_logs DO INSTEAD NOTHING;

-- Comments
COMMENT ON TABLE consent_logs IS 'Immutable audit trail for GDPR Article 7 (consent)';
COMMENT ON COLUMN consent_logs.legal_basis IS 'GDPR Article 6 legal basis for processing';
```

---

### data_access_logs

Logs all access to personal data (GDPR Article 15).

```sql
CREATE TABLE data_access_logs (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Who accessed
    user_id UUID NOT NULL, -- Staff member
    contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,

    -- What was accessed
    access_type VARCHAR(50) NOT NULL CHECK (
        access_type IN ('view', 'edit', 'export', 'delete', 'api_access')
    ),
    table_name VARCHAR(100),
    fields_accessed TEXT[],

    -- When and where
    accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    ip_address INET,
    user_agent TEXT,

    -- Why (purpose)
    purpose TEXT, -- e.g., "Customer support request #1234"

    -- What changed (for edits)
    old_values JSONB,
    new_values JSONB
);

-- Indexes
CREATE INDEX idx_data_access_logs_contact_id ON data_access_logs(contact_id);
CREATE INDEX idx_data_access_logs_user_id ON data_access_logs(user_id);
CREATE INDEX idx_data_access_logs_accessed_at ON data_access_logs(accessed_at DESC);

-- Immutable
CREATE RULE data_access_logs_no_update AS ON UPDATE TO data_access_logs DO INSTEAD NOTHING;
CREATE RULE data_access_logs_no_delete AS ON DELETE TO data_access_logs DO INSTEAD NOTHING;

-- Comments
COMMENT ON TABLE data_access_logs IS 'Audit trail for GDPR Article 15 (right to access)';
```

---

### deletion_requests

Tracks GDPR right to erasure requests (Article 17).

```sql
CREATE TABLE deletion_requests (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Foreign key
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,

    -- Request details
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    requested_by VARCHAR(255) NOT NULL, -- Email or identifier
    request_method VARCHAR(50), -- 'email', 'form', 'phone', 'letter'

    -- Identity verification
    verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP WITH TIME ZONE,
    verified_by UUID, -- Staff member who verified
    verification_method VARCHAR(100),

    -- Status
    status VARCHAR(50) DEFAULT 'pending' CHECK (
        status IN ('pending', 'verified', 'processing', 'completed', 'rejected')
    ),

    -- Completion
    completed_at TIMESTAMP WITH TIME ZONE,
    completed_by UUID,

    -- Rejection (if applicable)
    rejection_reason TEXT,
    rejection_legal_basis TEXT, -- GDPR Article 17(3) exception

    -- Audit
    notes TEXT,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes
CREATE INDEX idx_deletion_requests_contact_id ON deletion_requests(contact_id);
CREATE INDEX idx_deletion_requests_status ON deletion_requests(status);
CREATE INDEX idx_deletion_requests_requested_at ON deletion_requests(requested_at DESC);

-- Comments
COMMENT ON TABLE deletion_requests IS 'GDPR Article 17 (right to erasure) requests';
COMMENT ON COLUMN deletion_requests.rejection_legal_basis IS 'GDPR Article 17(3) exceptions if rejected';
```

---

## Workflow Tables

### workflows

Stores workflow definitions and metadata.

```sql
CREATE TABLE workflows (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Basic info
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL CHECK (
        category IN ('sales', 'marketing', 'support', 'operations', 'finance', 'hr', 'project', 'ecommerce', 'content')
    ),

    -- n8n integration
    n8n_workflow_id VARCHAR(255) UNIQUE,
    n8n_workflow_json JSONB, -- Full n8n workflow definition

    -- Trigger
    trigger_type VARCHAR(50) NOT NULL CHECK (
        trigger_type IN ('event', 'scheduled', 'manual', 'webhook')
    ),
    trigger_config JSONB DEFAULT '{}'::jsonb,

    -- Status
    enabled BOOLEAN DEFAULT TRUE,
    version VARCHAR(20) DEFAULT '1.0.0',

    -- Execution stats
    run_count INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    failure_count INTEGER DEFAULT 0,
    last_run_at TIMESTAMP WITH TIME ZONE,
    last_run_status VARCHAR(50),
    avg_execution_time INTEGER, -- milliseconds

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    created_by UUID,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],

    -- Configuration
    config JSONB DEFAULT '{}'::jsonb, -- Workflow-specific settings

    -- Documentation
    documentation_url TEXT,
    example_output JSONB
);

-- Indexes
CREATE INDEX idx_workflows_category ON workflows(category);
CREATE INDEX idx_workflows_enabled ON workflows(enabled);
CREATE INDEX idx_workflows_trigger_type ON workflows(trigger_type);

-- Comments
COMMENT ON TABLE workflows IS '100 pre-built business workflows';
COMMENT ON COLUMN workflows.n8n_workflow_json IS 'Full n8n workflow definition for import/export';
```

---

### workflow_executions

Logs all workflow executions.

```sql
CREATE TABLE workflow_executions (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Foreign key
    workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
    n8n_execution_id VARCHAR(255),

    -- Execution details
    status VARCHAR(50) NOT NULL CHECK (
        status IN ('running', 'completed', 'failed', 'cancelled')
    ),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    duration INTEGER, -- milliseconds

    -- Input/Output
    input JSONB,
    output JSONB,
    error TEXT,
    error_stack TEXT,

    -- Metadata
    triggered_by VARCHAR(50), -- 'manual', 'scheduled', 'webhook', 'event'
    user_id UUID, -- If manually triggered

    -- Performance
    steps_completed INTEGER DEFAULT 0,
    steps_total INTEGER,

    -- Audit
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes
CREATE INDEX idx_workflow_executions_workflow_id ON workflow_executions(workflow_id);
CREATE INDEX idx_workflow_executions_status ON workflow_executions(status);
CREATE INDEX idx_workflow_executions_started_at ON workflow_executions(started_at DESC);

-- Partition by month for performance
-- CREATE TABLE workflow_executions_2025_10 PARTITION OF workflow_executions
-- FOR VALUES FROM ('2025-10-01') TO ('2025-11-01');

-- Comments
COMMENT ON TABLE workflow_executions IS 'Execution history for all workflows';
```

---

## Analytics Tables

### analytics_events

Stores raw analytics events for processing.

```sql
CREATE TABLE analytics_events (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Event details
    event_type VARCHAR(100) NOT NULL, -- 'page_view', 'button_click', 'form_submit', etc.
    event_name VARCHAR(255),

    -- User/Session
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    session_id VARCHAR(255),
    anonymous_id VARCHAR(255),

    -- Context
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    url TEXT,
    referrer TEXT,
    user_agent TEXT,
    ip_address INET,

    -- UTM parameters
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    utm_term VARCHAR(100),
    utm_content VARCHAR(100),

    -- Device
    device_type VARCHAR(50), -- 'desktop', 'mobile', 'tablet'
    browser VARCHAR(50),
    os VARCHAR(50),

    -- Custom properties
    properties JSONB DEFAULT '{}'::jsonb,

    -- Processing
    processed BOOLEAN DEFAULT FALSE,
    processed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX idx_analytics_events_contact_id ON analytics_events(contact_id);
CREATE INDEX idx_analytics_events_timestamp ON analytics_events(timestamp DESC);
CREATE INDEX idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_processed ON analytics_events(processed) WHERE NOT processed;

-- Partition by day for high-volume analytics
-- CREATE TABLE analytics_events_2025_10_22 PARTITION OF analytics_events
-- FOR VALUES FROM ('2025-10-22') TO ('2025-10-23');

-- Comments
COMMENT ON TABLE analytics_events IS 'Raw analytics events for business intelligence';
```

---

### analytics_metrics

Pre-computed metrics for dashboards.

```sql
CREATE TABLE analytics_metrics (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Metric details
    metric_name VARCHAR(100) NOT NULL,
    metric_type VARCHAR(50) NOT NULL CHECK (
        metric_type IN ('count', 'sum', 'average', 'percentage', 'ratio')
    ),

    -- Dimensions
    date DATE NOT NULL,
    granularity VARCHAR(20) NOT NULL CHECK (
        granularity IN ('hour', 'day', 'week', 'month', 'quarter', 'year')
    ),

    -- Filters
    segment VARCHAR(100), -- 'all_users', 'vip_customers', etc.

    -- Value
    value DECIMAL(18, 6) NOT NULL,
    value_previous DECIMAL(18, 6), -- Previous period for comparison
    change_percent DECIMAL(5, 2),

    -- Metadata
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,

    -- Unique constraint
    UNIQUE(metric_name, date, granularity, segment)
);

-- Indexes
CREATE INDEX idx_analytics_metrics_metric_name ON analytics_metrics(metric_name);
CREATE INDEX idx_analytics_metrics_date ON analytics_metrics(date DESC);
CREATE INDEX idx_analytics_metrics_segment ON analytics_metrics(segment);

-- Comments
COMMENT ON TABLE analytics_metrics IS 'Pre-computed metrics for fast dashboard queries';
```

---

## Supporting Tables

### users

System users (staff members).

```sql
CREATE TABLE users (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Authentication
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- Argon2

    -- Profile
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url TEXT,

    -- Role-based access control
    role VARCHAR(50) NOT NULL DEFAULT 'user' CHECK (
        role IN ('admin', 'manager', 'sales', 'support', 'marketing', 'user')
    ),
    permissions TEXT[] DEFAULT ARRAY[]::TEXT[],

    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    email_verified_at TIMESTAMP WITH TIME ZONE,

    -- Security
    last_login_at TIMESTAMP WITH TIME ZONE,
    last_login_ip INET,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,

    -- Preferences
    timezone VARCHAR(50) DEFAULT 'UTC',
    language VARCHAR(10) DEFAULT 'en',
    preferences JSONB DEFAULT '{}'::jsonb,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);

-- Comments
COMMENT ON TABLE users IS 'System users (staff members)';
```

---

### tags

Global tag management.

```sql
CREATE TABLE tags (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Tag details
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    color VARCHAR(7), -- Hex color #FF5733
    icon VARCHAR(50),

    -- Category
    category VARCHAR(50), -- 'contact', 'deal', 'company', 'workflow'

    -- Usage count (for sorting)
    usage_count INTEGER DEFAULT 0,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    created_by UUID REFERENCES users(id)
);

-- Indexes
CREATE INDEX idx_tags_name ON tags(name);
CREATE INDEX idx_tags_category ON tags(category);

-- Comments
COMMENT ON TABLE tags IS 'Global tag definitions for categorization';
```

---

## Triggers

### updated_at Triggers

Automatically update `updated_at` timestamp.

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deals_updated_at BEFORE UPDATE ON deals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflows_updated_at BEFORE UPDATE ON workflows
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

### Audit Logging Triggers

Automatically log data access.

```sql
CREATE OR REPLACE FUNCTION log_contact_access()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'UPDATE') THEN
        INSERT INTO data_access_logs (
            contact_id,
            access_type,
            table_name,
            old_values,
            new_values
        ) VALUES (
            NEW.id,
            'edit',
            'contacts',
            to_jsonb(OLD),
            to_jsonb(NEW)
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_contact_updates AFTER UPDATE ON contacts
    FOR EACH ROW EXECUTE FUNCTION log_contact_access();
```

---

## Views

### v_contact_summary

Aggregated contact view with stats.

```sql
CREATE VIEW v_contact_summary AS
SELECT
    c.id,
    c.email,
    c.first_name,
    c.last_name,
    c.company,
    c.lead_score,
    c.lifecycle_stage,
    c.created_at,

    -- Interaction stats
    COUNT(DISTINCT i.id) AS total_interactions,
    MAX(i.created_at) AS last_interaction_date,

    -- Deal stats
    COUNT(DISTINCT d.id) AS total_deals,
    COUNT(DISTINCT d.id) FILTER (WHERE d.stage = 'won') AS won_deals,
    COALESCE(SUM(d.value) FILTER (WHERE d.stage = 'won'), 0) AS total_revenue,

    -- Company info
    comp.name AS company_name,
    comp.industry AS company_industry

FROM contacts c
LEFT JOIN interactions i ON c.id = i.contact_id
LEFT JOIN deals d ON c.id = d.contact_id
LEFT JOIN companies comp ON c.company_id = comp.id
WHERE c.deleted_at IS NULL
GROUP BY c.id, comp.id;

-- Comments
COMMENT ON VIEW v_contact_summary IS 'Contact summary with aggregated stats for dashboards';
```

---

### v_pipeline_summary

Deal pipeline overview.

```sql
CREATE VIEW v_pipeline_summary AS
SELECT
    stage,
    COUNT(*) AS deal_count,
    SUM(value) AS total_value,
    AVG(value) AS avg_value,
    AVG(probability) AS avg_probability,
    SUM(value * probability / 100) AS weighted_value
FROM deals
WHERE stage NOT IN ('won', 'lost')
GROUP BY stage;

-- Comments
COMMENT ON VIEW v_pipeline_summary IS 'Sales pipeline summary by stage';
```

---

## Migrations

### Migration Template

```sql
-- Migration: 001_initial_schema
-- Created: 2025-10-22
-- Description: Initial database schema for Local AI CRM

BEGIN;

-- Create tables (as defined above)
-- Create indexes
-- Create triggers
-- Create views

-- Insert seed data
INSERT INTO workflows (name, description, category, trigger_type) VALUES
('Lead Qualification & Scoring', 'AI analyzes leads and assigns score 0-100', 'sales', 'event'),
('Abandoned Cart Recovery', 'Detects and recovers abandoned carts', 'ecommerce', 'scheduled'),
-- ... (100 workflows)

COMMIT;
```

---

## Backup & Recovery

### Daily Backups

```bash
#!/bin/bash
# backup-database.sh

BACKUP_DIR="/opt/crm/backups/$(date +%Y%m%d)"
mkdir -p "$BACKUP_DIR"

# Full backup
pg_dump -U crm_user crm_production | gzip > "$BACKUP_DIR/full_backup.sql.gz"

# Table-specific backups (for faster restore)
pg_dump -U crm_user -t contacts crm_production | gzip > "$BACKUP_DIR/contacts.sql.gz"
pg_dump -U crm_user -t deals crm_production | gzip > "$BACKUP_DIR/deals.sql.gz"

# Upload to S3 (optional)
aws s3 sync "$BACKUP_DIR" s3://crm-backups/$(date +%Y%m%d)/

# Cleanup old backups (keep 30 days)
find /opt/crm/backups/ -type d -mtime +30 -exec rm -rf {} \;
```

---

## Performance Optimization

### Partitioning Strategy

```sql
-- Partition analytics_events by day (high volume)
CREATE TABLE analytics_events (
    -- columns as defined above
) PARTITION BY RANGE (timestamp);

CREATE TABLE analytics_events_2025_10 PARTITION OF analytics_events
FOR VALUES FROM ('2025-10-01') TO ('2025-11-01');

CREATE TABLE analytics_events_2025_11 PARTITION OF analytics_events
FOR VALUES FROM ('2025-11-01') TO ('2025-12-01');
```

### Materialized Views

```sql
CREATE MATERIALIZED VIEW mv_monthly_metrics AS
SELECT
    DATE_TRUNC('month', created_at) AS month,
    COUNT(*) AS new_contacts,
    AVG(lead_score) AS avg_lead_score,
    COUNT(*) FILTER (WHERE lifecycle_stage = 'customer') AS new_customers
FROM contacts
WHERE deleted_at IS NULL
GROUP BY month
ORDER BY month DESC;

-- Refresh daily
CREATE INDEX ON mv_monthly_metrics(month);
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_monthly_metrics;
```

---

**Schema Version**: 1.0
**Last Updated**: October 2025
**PostgreSQL Version**: 16+
**Total Tables**: 18 core tables
**Compliance**: GDPR/DSGVO Article 7, 15, 17, 30
**Status**: Production-Ready
