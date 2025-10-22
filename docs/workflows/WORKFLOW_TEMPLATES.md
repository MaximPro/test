# Workflow Templates
## 100 Pre-Built Business Workflows for SuperSynergy

---

## Overview

This document provides detailed templates for all 100 pre-built workflows in SuperSynergy. Each workflow includes:
- **Description**: What the workflow does
- **Trigger**: What initiates the workflow
- **Steps**: Detailed execution flow
- **Configuration**: Customizable parameters
- **n8n Template**: Visual workflow representation

---

## Table of Contents

1. [Sales & Marketing (Workflows 1-20)](#sales--marketing)
2. [Customer Support (Workflows 21-35)](#customer-support)
3. [Operations & Admin (Workflows 36-50)](#operations--admin)
4. [Finance & Accounting (Workflows 51-60)](#finance--accounting)
5. [HR & Recruitment (Workflows 61-70)](#hr--recruitment)
6. [Project Management (Workflows 71-80)](#project-management)
7. [E-commerce (Workflows 81-90)](#e-commerce)
8. [Content Creation (Workflows 91-100)](#content-creation)

---

## Sales & Marketing

### Workflow 001: Lead Qualification & Scoring

**Category**: Sales & Marketing
**Difficulty**: Medium
**Average Execution Time**: 2-5 seconds

#### Description
Automatically analyzes incoming leads and assigns a score from 0-100 based on various factors including company size, budget, decision-making authority, and engagement level.

#### Trigger
- **Type**: Event
- **Event**: `contact.created` or `contact.updated`
- **Frequency**: Real-time

#### Steps

```yaml
1. Receive Contact Data
   - Extract: email, company, title, website, industry
   - Validate: required fields present

2. AI Analysis
   - Agent: Sales Agent (LLaMA2-13B)
   - Prompt: "Analyze this lead and score 0-100 based on:
     - Job title (decision maker weight: 30%)
     - Company size (weight: 20%)
     - Industry fit (weight: 20%)
     - Engagement level (weight: 15%)
     - Budget indicators (weight: 15%)

     Lead data: {contact_data}"

   - Parse response for score + reasoning

3. Enrich Data
   - API: Clearbit/FullContact (optional)
   - Gather: company data, social profiles, tech stack

4. Calculate Final Score
   - AI score: 60%
   - Enrichment data: 20%
   - Engagement history: 20%

5. Update CRM
   - Field: leadScore
   - Field: leadScoreReason
   - Field: lastScoredAt

6. Trigger Actions
   - If score >= 80: Alert sales team + assign to rep
   - If score 60-79: Add to nurture campaign
   - If score < 60: Add to low-priority follow-up
```

#### Configuration

```json
{
  "scoring": {
    "weights": {
      "jobTitle": 0.30,
      "companySize": 0.20,
      "industryFit": 0.20,
      "engagement": 0.15,
      "budget": 0.15
    },
    "thresholds": {
      "hot": 80,
      "warm": 60,
      "cold": 0
    }
  },
  "enrichment": {
    "enabled": true,
    "provider": "clearbit",
    "fallback": "fullcontact"
  },
  "notifications": {
    "salesTeam": {
      "enabled": true,
      "channel": "slack",
      "minScore": 80
    }
  }
}
```

#### n8n Workflow JSON

```json
{
  "name": "Lead Qualification & Scoring",
  "nodes": [
    {
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "position": [250, 300],
      "webhookId": "contact-created"
    },
    {
      "name": "AI Lead Scoring",
      "type": "n8n-nodes-base.httpRequest",
      "position": [450, 300],
      "parameters": {
        "url": "http://ai-service:8001/api/agents/sales/score-lead",
        "method": "POST",
        "bodyParameters": {
          "contactId": "={{$json.contactId}}"
        }
      }
    },
    {
      "name": "Update CRM",
      "type": "n8n-nodes-base.httpRequest",
      "position": [650, 300],
      "parameters": {
        "url": "http://crm-service:8000/api/contacts/={{$json.contactId}}",
        "method": "PUT",
        "bodyParameters": {
          "leadScore": "={{$node['AI Lead Scoring'].json.leadScore}}",
          "leadScoreReason": "={{$node['AI Lead Scoring'].json.reasoning}}"
        }
      }
    },
    {
      "name": "Check Score",
      "type": "n8n-nodes-base.if",
      "position": [850, 300],
      "parameters": {
        "conditions": {
          "number": [
            {
              "value1": "={{$node['AI Lead Scoring'].json.leadScore}}",
              "operation": "largerEqual",
              "value2": 80
            }
          ]
        }
      }
    },
    {
      "name": "Notify Sales Team",
      "type": "n8n-nodes-base.slack",
      "position": [1050, 200],
      "parameters": {
        "channel": "#sales",
        "text": "🔥 Hot lead! {{$json.firstName}} {{$json.lastName}} scored {{$json.leadScore}}"
      }
    }
  ],
  "connections": {
    "Webhook": {
      "main": [[{"node": "AI Lead Scoring", "type": "main", "index": 0}]]
    },
    "AI Lead Scoring": {
      "main": [[{"node": "Update CRM", "type": "main", "index": 0}]]
    },
    "Update CRM": {
      "main": [[{"node": "Check Score", "type": "main", "index": 0}]]
    },
    "Check Score": {
      "main": [
        [{"node": "Notify Sales Team", "type": "main", "index": 0}],
        []
      ]
    }
  }
}
```

---

### Workflow 002: Abandoned Cart Recovery

**Category**: Sales & Marketing / E-commerce
**Difficulty**: Easy
**Average Execution Time**: 3-10 seconds

#### Description
Detects when a customer abandons their shopping cart and automatically sends a personalized recovery email with a dynamic discount code after a configurable delay.

#### Trigger
- **Type**: Time-based check
- **Frequency**: Every 15 minutes
- **Condition**: Cart age > 1 hour && order not completed

#### Steps

```yaml
1. Query Abandoned Carts
   - Database: carts table
   - Filter:
     - updated_at < NOW() - INTERVAL '1 hour'
     - email IS NOT NULL
     - recovery_email_sent = FALSE
     - order_id IS NULL

2. For Each Cart:
   a. Get Customer Data
      - Fetch contact from CRM
      - Get previous purchase history
      - Check email engagement score

   b. AI Email Generation
      - Agent: Marketing Agent
      - Input: cart_items, cart_value, customer_history
      - Output: personalized email subject + body

   c. Generate Discount Code
      - Base discount: 10%
      - If cart_value > €100: 15%
      - If cart_value > €250: 20%
      - Code format: COMEBACK{discount}{random}

   d. Send Email
      - To: customer email
      - Subject: AI-generated subject
      - Body: AI-generated body + discount code
      - Include: cart items, direct checkout link

   e. Update Cart
      - Set recovery_email_sent = TRUE
      - Set recovery_email_sent_at = NOW()

   f. Log Interaction
      - CRM interaction log
      - Type: email_sent
      - Campaign: abandoned_cart_recovery
```

#### Configuration

```json
{
  "timing": {
    "checkInterval": "15 minutes",
    "abandonmentThreshold": "1 hour",
    "maxRecoveryEmails": 3,
    "emailSequence": [
      {
        "delay": "1 hour",
        "discount": "10%",
        "urgency": "low"
      },
      {
        "delay": "24 hours",
        "discount": "15%",
        "urgency": "medium"
      },
      {
        "delay": "3 days",
        "discount": "20%",
        "urgency": "high"
      }
    ]
  },
  "discounts": {
    "enabled": true,
    "baseDiscount": 10,
    "valueThresholds": [
      {"min": 0, "max": 100, "discount": 10},
      {"min": 100, "max": 250, "discount": 15},
      {"min": 250, "max": 999999, "discount": 20}
    ],
    "codeFormat": "COMEBACK{discount}{random}",
    "validityDays": 7
  },
  "email": {
    "fromName": "Your Store",
    "fromEmail": "noreply@yourstore.com",
    "aiGeneration": true,
    "template": "abandoned_cart"
  }
}
```

---

### Workflow 003: Email Campaign Builder

**Category**: Sales & Marketing
**Difficulty**: Medium
**Average Execution Time**: 5-15 seconds per recipient

#### Description
AI-powered email campaign that generates personalized content for each recipient based on their profile, previous interactions, and preferences.

#### Trigger
- **Type**: Manual or scheduled
- **Initiated by**: User action or cron schedule

#### Steps

```yaml
1. Define Campaign
   - Name: campaign_name
   - Segment: target_segment (e.g., "VIP customers", "Inactive leads")
   - Goal: conversion, engagement, reactivation

2. Fetch Recipients
   - Query CRM for segment
   - Filter: consent_marketing = TRUE
   - Exclude: unsubscribed, bounced, complained

3. For Each Recipient:
   a. Gather Context
      - Customer data: name, company, title
      - Purchase history: recent orders, favorite products
      - Engagement: email opens, clicks, website visits
      - Preferences: interests, communication frequency

   b. AI Content Generation
      - Agent: Marketing Agent (LLaMA2-13B)
      - Prompt Template:
        "Create a personalized email for {customer_name} at {company}.
        Context: {customer_context}
        Goal: {campaign_goal}
        Tone: {brand_tone}
        Length: 150-200 words
        Include: CTA button"

      - Output: subject, preheader, body, cta_text

   c. Optimize Send Time
      - Analyze: previous email open times
      - Timezone: customer timezone
      - Best time: highest open probability

   d. Schedule Email
      - Queue for sending at optimal time
      - Track: campaign_id, recipient_id, send_time

4. Monitor Campaign
   - Track: sent, delivered, opened, clicked, converted
   - Real-time dashboard updates

5. AI Optimization
   - Analyze: what's working
   - Suggest: subject line improvements, content tweaks
   - Auto-adjust: send times for remaining recipients
```

#### Configuration

```json
{
  "campaign": {
    "name": "Q4 Product Launch",
    "segment": "active_customers",
    "goal": "conversion"
  },
  "personalization": {
    "level": "high",
    "aiGeneration": true,
    "fallbackTemplate": "default_campaign"
  },
  "timing": {
    "sendSchedule": "optimal",
    "timezone": "recipient",
    "respectQuietHours": true,
    "quietHours": {
      "start": "22:00",
      "end": "08:00"
    }
  },
  "abTesting": {
    "enabled": true,
    "variants": 2,
    "sampleSize": "20%",
    "winnerMetric": "click_rate"
  }
}
```

---

## Customer Support

### Workflow 021: Ticket Auto-Routing

**Category**: Customer Support
**Difficulty**: Medium
**Average Execution Time**: 1-3 seconds

#### Description
Uses AI to analyze incoming support tickets, categorize them, determine priority, and route to the best-qualified agent.

#### Trigger
- **Type**: Event
- **Event**: `ticket.created`
- **Frequency**: Real-time

#### Steps

```yaml
1. Receive Ticket
   - Extract: subject, body, customer_id, channel
   - Validate: required fields

2. AI Analysis
   - Agent: Support Agent (LLaMA2-70B for accuracy)
   - Analyze:
     a. Category (technical, billing, shipping, general)
     b. Priority (urgent, high, normal, low)
     c. Sentiment (angry, frustrated, neutral, happy)
     d. Complexity (simple, moderate, complex)
     e. Required expertise (technical, sales, customer success)

   - Prompt: "Analyze this support ticket and provide:
     - Category
     - Priority (P1/P2/P3/P4)
     - Sentiment score (-1 to 1)
     - Complexity (1-10)
     - Required skills

     Ticket: {ticket_data}"

3. Check Knowledge Base
   - Vector search: similar resolved tickets
   - If high similarity (>90%):
     - Suggest canned response
     - Optionally: auto-respond for simple queries

4. Agent Routing
   - Find available agents with:
     - Required skills
     - Currently under capacity
     - Highest customer satisfaction score

   - Routing algorithm:
     skill_match_score * 0.5 +
     availability_score * 0.3 +
     satisfaction_score * 0.2

5. Assign Ticket
   - Update: assigned_to, assigned_at
   - Notify: agent via Slack/email
   - Include: AI analysis summary

6. Set SLA
   - Calculate due_date based on priority:
     - P1 (urgent): 1 hour
     - P2 (high): 4 hours
     - P3 (normal): 24 hours
     - P4 (low): 72 hours

7. Monitor
   - Track: first_response_time
   - Alert: if approaching SLA breach
```

#### Configuration

```json
{
  "ai": {
    "model": "llama2-70b",
    "temperature": 0.3,
    "confidenceThreshold": 0.7
  },
  "routing": {
    "algorithm": "weighted",
    "weights": {
      "skillMatch": 0.5,
      "availability": 0.3,
      "satisfaction": 0.2
    },
    "fallback": "round_robin"
  },
  "sla": {
    "p1": "1 hour",
    "p2": "4 hours",
    "p3": "24 hours",
    "p4": "72 hours"
  },
  "autoResponse": {
    "enabled": true,
    "confidenceThreshold": 0.95,
    "categories": ["password_reset", "order_status"]
  }
}
```

---

## Operations & Admin

### Workflow 036: Invoice Processing

**Category**: Operations & Admin
**Difficulty**: Medium
**Average Execution Time**: 5-10 seconds

#### Description
Automatically processes incoming invoices using OCR, validates against purchase orders, routes for approval, and schedules payment.

#### Trigger
- **Type**: Event
- **Event**: Email received with PDF attachment
- **Frequency**: Real-time

#### Steps

```yaml
1. Receive Invoice
   - Monitor: invoices@company.com inbox
   - Detect: PDF attachments
   - Download: invoice PDF

2. OCR Extraction
   - Tool: Tesseract OCR / scribe.js-ocr
   - Extract:
     - Vendor name
     - Invoice number
     - Invoice date
     - Due date
     - Line items
     - Subtotal, tax, total
     - Bank details

3. Validate Data
   - Check: vendor exists in system
   - Verify: invoice number not duplicate
   - Validate: amounts calculate correctly

4. Match to PO
   - Search: purchase_orders table
   - Match criteria:
     - Vendor
     - PO number (from invoice)
     - Amount within tolerance (±5%)

   - If no match:
     - Alert: procurement team
     - Request: PO number

5. Approval Routing
   - Based on amount:
     - < €500: Auto-approve
     - €500-5000: Manager approval
     - €5000-25000: Director approval
     - > €25000: CFO approval

   - Send approval request via Slack/email
   - Include: invoice PDF, PO details, comparison

6. Schedule Payment
   - If approved:
     - Calculate: payment_date (invoice due date - 3 days)
     - Create: payment batch entry
     - Notify: finance team

7. Update Accounting
   - Create journal entry:
     - Debit: expense account
     - Credit: accounts payable
   - Update: budget tracking
```

#### Configuration

```json
{
  "ocr": {
    "engine": "tesseract",
    "language": "eng+deu",
    "confidence": 0.85
  },
  "validation": {
    "requirePO": true,
    "amountTolerance": 0.05,
    "duplicateCheck": true
  },
  "approval": {
    "thresholds": [
      {"max": 500, "approver": "auto"},
      {"max": 5000, "approver": "manager"},
      {"max": 25000, "approver": "director"},
      {"max": 999999, "approver": "cfo"}
    ],
    "timeout": "48 hours",
    "reminderInterval": "24 hours"
  },
  "payment": {
    "advanceDays": 3,
    "method": "bank_transfer",
    "batchDay": "friday"
  }
}
```

---

## Finance & Accounting

### Workflow 051: Accounts Receivable Aging

**Category**: Finance & Accounting
**Difficulty**: Easy
**Average Execution Time**: 30-60 seconds

#### Description
Tracks outstanding invoices, sends automated payment reminders based on aging, and escalates overdue accounts.

#### Trigger
- **Type**: Scheduled
- **Frequency**: Daily at 9 AM
- **Days**: Monday-Friday

#### Steps

```yaml
1. Query Outstanding Invoices
   - Database: invoices table
   - Filter: status = 'sent' AND paid = FALSE
   - Sort: due_date ASC

2. Calculate Aging Buckets
   For each invoice:
   - Current: due_date >= today
   - 1-30 days: 1-30 days overdue
   - 31-60 days: 31-60 days overdue
   - 61-90 days: 61-90 days overdue
   - 90+ days: 90+ days overdue

3. Send Reminders
   Based on aging:

   a. Current (due in 3 days):
      - Email: "Friendly reminder - payment due soon"
      - Tone: friendly, helpful

   b. 1-30 days overdue:
      - Email: "Payment overdue - please remit"
      - Tone: professional, firm
      - CC: account manager

   c. 31-60 days overdue:
      - Email: "Second notice - immediate payment required"
      - Tone: firm, urgent
      - CC: account manager + finance director
      - Include: late fee notice

   d. 61-90 days overdue:
      - Email: "Final notice - account under review"
      - Tone: very firm
      - CC: entire management team
      - Include: collection threat

   e. 90+ days overdue:
      - Action: Send to collections
      - Alert: CFO
      - Consider: legal action

4. Generate Report
   - Summary by aging bucket
   - Total outstanding: €amount
   - Top 10 overdue accounts
   - Trend: vs last week/month
   - Send to: CFO, finance team

5. Update Customer Records
   - Flag: payment_history
   - Adjust: credit limit if needed
   - Note: follow-up actions taken
```

#### Configuration

```json
{
  "schedule": {
    "frequency": "daily",
    "time": "09:00",
    "timezone": "Europe/Berlin",
    "skipWeekends": true
  },
  "reminders": {
    "current": {
      "daysBeforeDue": 3,
      "template": "friendly_reminder",
      "enabled": true
    },
    "overdue": {
      "1-30": {
        "frequency": "weekly",
        "template": "first_reminder",
        "cc": ["account_manager"]
      },
      "31-60": {
        "frequency": "weekly",
        "template": "second_notice",
        "cc": ["account_manager", "finance_director"],
        "lateFee": true,
        "lateFeePercent": 2
      },
      "61-90": {
        "frequency": "daily",
        "template": "final_notice",
        "cc": ["management_team"]
      },
      "90+": {
        "action": "collections",
        "notify": ["cfo"],
        "legal": true
      }
    }
  },
  "reporting": {
    "recipients": ["cfo@company.com", "finance@company.com"],
    "format": "pdf",
    "includeChart": true
  }
}
```

---

## Workflow Template Structure

Each of the remaining 90+ workflows follows a similar structure:

```yaml
Workflow ID: {number}
Name: {descriptive_name}
Category: {category}
Difficulty: {easy|medium|hard}
Avg Execution Time: {seconds}

Description: {what_it_does}

Trigger:
  Type: {event|scheduled|manual}
  Event: {event_name} (if applicable)
  Frequency: {frequency}

Steps:
  1. {step_name}
     - {action}
     - {action}

  2. {step_name}
     - {action}

Configuration:
  {json_config}

n8n Workflow JSON:
  {workflow_json}
```

---

## Quick Reference: All 100 Workflows

### Sales & Marketing (1-20)
1. ✅ Lead Qualification & Scoring (detailed above)
2. ✅ Abandoned Cart Recovery (detailed above)
3. ✅ Email Campaign Builder (detailed above)
4. Social Media Content Generation
5. Competitor Analysis
6. Sales Pipeline Management
7. Customer Segmentation
8. Proposal Generator
9. Cold Email Outreach
10. Landing Page Optimizer
11. Sales Meeting Scheduler
12. Quote & Invoice Generator
13. Referral Program Manager
14. Win/Loss Analysis
15. Customer Journey Mapping
16. Re-engagement Campaign
17. Product Launch Campaign
18. Webinar Registration & Follow-up
19. Sales Territory Optimization
20. Customer Lifetime Value Prediction

### Customer Support (21-35)
21. ✅ Ticket Auto-Routing (detailed above)
22. Support Knowledge Base RAG
23. Sentiment Analysis & Escalation
24. SLA Monitoring & Alerts
25. Customer Satisfaction Survey
26. Refund & Return Processing
27. Product Defect Tracking
28. Live Chat Hand-off
29. Multi-language Support
30. Warranty Claim Processing
31. VIP Customer Alerts
32. Support Agent Performance
33. Proactive Issue Detection
34. Support Chatbot Training
35. Customer Onboarding Flow

### Operations & Admin (36-50)
36. ✅ Invoice Processing (detailed above)
37. Expense Report Automation
38. Document Approval Workflow
39. Contract Management
40. Vendor Onboarding
41. Purchase Order Creation
42. Inventory Reordering
43. Asset Management
44. Meeting Scheduler
45. Email Signature Manager
46. Data Backup Verification
47. Compliance Document Collection
48. Lease Management
49. Insurance Claim Filing
50. Office Supplies Ordering

### Finance & Accounting (51-60)
51. ✅ Accounts Receivable Aging (detailed above)
52. Cash Flow Forecasting
53. Budget vs. Actual Analysis
54. Financial Statement Generation
55. Tax Document Preparation
56. Payroll Processing
57. Subscription Revenue Recognition
58. Multi-currency Conversion
59. Fraud Detection
60. Financial Dashboard

### HR & Recruitment (61-70)
61. Job Posting Automation
62. Resume Screening
63. Interview Scheduling
64. Onboarding Checklist
65. Performance Review Cycle
66. Leave Request Processing
67. Benefits Enrollment
68. Employee Satisfaction Survey
69. Offboarding Workflow
70. Training & Development

### Project Management (71-80)
71. Project Kickoff
72. Task Assignment & Tracking
73. Sprint Planning
74. Daily Standup Summary
75. Risk Management
76. Change Request Processing
77. Resource Allocation
78. Project Status Report
79. Bug Tracking & Prioritization
80. Project Retrospective

### E-commerce (81-90)
81. Product Listing Optimization
82. Order Fulfillment
83. Inventory Sync Across Channels
84. Customer Review Management
85. Dynamic Pricing
86. Upsell & Cross-sell Recommendations
87. Shipping Cost Calculator
88. Product Launch Campaign
89. Loyalty Program Management
90. Return Merchandise Authorization

### Content Creation (91-100)
91. Blog Post Generator
92. Social Media Calendar
93. Video Script Writer
94. Email Newsletter
95. Press Release Generator
96. Podcast Episode Planner
97. Infographic Creator
98. White Paper Generator
99. Content Repurposing
100. SEO Optimization

---

## Workflow Marketplace

Coming soon: Community-contributed workflows

**Submit your workflow:**
1. Fork the repository
2. Add your workflow to this file
3. Submit a pull request
4. Get featured in the marketplace

**Workflow guidelines:**
- Clear description
- Well-documented steps
- Tested and working
- Configurable parameters
- n8n template included

---

## Next Steps

1. **Review workflows**: Pick 3-5 that fit your business
2. **Customize**: Adjust configurations to your needs
3. **Test**: Run in development environment
4. **Deploy**: Enable in production
5. **Monitor**: Track performance and iterate

---

**Document Version**: 1.0
**Last Updated**: October 2025
**Total Workflows**: 100
**Status**: 6 detailed, 94 outlined (full details coming in future updates)
