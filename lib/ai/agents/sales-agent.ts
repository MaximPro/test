/**
 * Sales Agent
 *
 * Capabilities:
 * - BANT framework qualification
 * - Automated discovery calls
 * - Proposal generation
 * - Deal forecasting & pipeline optimization
 */

import { AgentBase, AgentConfig } from '../agent-base'

export class SalesAgent extends AgentBase {
  constructor() {
    const config: AgentConfig = {
      name: 'Sales Agent',
      description: 'Handles sales processes, qualification, and deal management',
      model: 'anthropic',
      temperature: 0.7,
      maxTokens: 8192,
      memory: true,
      tools: [
        {
          name: 'qualify_lead',
          description: 'Qualify a lead using BANT framework',
          parameters: {
            leadData: 'object',
          },
          execute: async (input) => {
            return { qualified: true, score: 85 }
          },
        },
        {
          name: 'generate_proposal',
          description: 'Generate a customized proposal',
          parameters: {
            clientData: 'object',
            requirements: 'array',
          },
          execute: async (input) => {
            return { proposal: 'Generated proposal content' }
          },
        },
        {
          name: 'forecast_deal',
          description: 'Forecast deal probability and timeline',
          parameters: {
            dealData: 'object',
          },
          execute: async (input) => {
            return { probability: 0.75, estimatedCloseDate: '2025-12-31' }
          },
        },
      ],
    }

    super(config)
  }

  protected getSystemPrompt(): string {
    return `You are a Sales Agent for SuperSynergy, specializing in consultative selling and deal management.

Your expertise includes:
1. BANT qualification (Budget, Authority, Need, Timeline)
2. Discovery call planning and execution
3. Proposal generation and customization
4. Deal forecasting and pipeline management
5. Objection handling and negotiation support

Sales Methodology:
- Consultative selling approach
- Value-based selling (focus on ROI)
- Solution selling (address pain points)
- Challenger sales (teach, tailor, take control)

Your Responsibilities:
1. Qualify leads thoroughly using BANT
2. Conduct effective discovery calls
3. Generate compelling, customized proposals
4. Accurately forecast deals
5. Optimize sales pipeline
6. Provide coaching and recommendations

Guidelines:
- Always focus on the customer's needs and pain points
- Quantify value and ROI
- Build trust through expertise
- Be consultative, not pushy
- Tailor your approach to buyer persona
- Follow up persistently but respectfully

When qualifying leads:
- Budget: Do they have allocated budget?
- Authority: Are they the decision maker?
- Need: Do they have a clear pain point?
- Timeline: When do they need a solution?

Your responses should:
- Be professional and persuasive
- Focus on value creation
- Include specific next actions
- Provide clear recommendations
- Anticipate objections`
  }

  protected async initialize(): Promise<void> {
    console.log('Sales Agent initialized')
  }

  getCapabilities(): string[] {
    return [
      'BANT Qualification',
      'Discovery Calls',
      'Proposal Generation',
      'Deal Forecasting',
      'Pipeline Optimization',
      'Objection Handling',
      'Negotiation Support',
      'Value Calculation',
      'Competitor Analysis',
    ]
  }

  /**
   * Qualify a lead using BANT
   */
  async qualifyLead(leadData: any): Promise<any> {
    const prompt = `Qualify this lead using the BANT framework:

Lead Information:
${JSON.stringify(leadData, null, 2)}

Provide:
1. Budget Assessment:
   - Estimated budget range
   - Budget timeline
   - Budget decision makers

2. Authority Assessment:
   - Decision maker identification
   - Decision making process
   - Stakeholder map

3. Need Assessment:
   - Primary pain points
   - Current solution (if any)
   - Urgency level
   - Impact of not solving

4. Timeline Assessment:
   - Target implementation date
   - Key milestones
   - Constraints and dependencies

5. Overall Qualification:
   - Qualification score (0-100)
   - Deal probability (%)
   - Recommended next steps
   - Red flags or concerns
   - Estimated deal value

Be thorough and provide specific insights.`

    return await this.execute(prompt)
  }

  /**
   * Generate a customized proposal
   */
  async generateProposal(clientData: any, requirements: string[]): Promise<any> {
    const prompt = `Generate a comprehensive sales proposal for:

Client: ${clientData.company}
Industry: ${clientData.industry || 'Not specified'}
Size: ${clientData.size || 'Not specified'}

Requirements:
${requirements.map((r, i) => `${i + 1}. ${r}`).join('\n')}

The proposal should include:

1. Executive Summary
   - Client challenges
   - Proposed solution
   - Expected outcomes

2. Problem Statement
   - Current situation
   - Pain points
   - Business impact

3. Proposed Solution
   - SuperSynergy capabilities
   - How we address each requirement
   - Implementation approach

4. Value Proposition
   - Quantified benefits
   - ROI calculation
   - Time to value

5. Investment
   - Pricing structure
   - Payment terms
   - What's included

6. Implementation Plan
   - Timeline
   - Milestones
   - Resource requirements

7. Success Metrics
   - KPIs
   - Measurement approach
   - Reporting

8. Next Steps
   - Immediate actions
   - Timeline
   - Contact information

Make it compelling, professional, and value-focused.`

    return await this.execute(prompt)
  }

  /**
   * Forecast deal probability
   */
  async forecastDeal(dealData: any): Promise<any> {
    const prompt = `Analyze this deal and provide a forecast:

Deal Information:
${JSON.stringify(dealData, null, 2)}

Provide:
1. Win Probability: X%
   - Justification
   - Key factors influencing probability

2. Estimated Close Date
   - Most likely date
   - Confidence range (best/worst case)

3. Deal Size Forecast
   - Expected value
   - Potential upsell opportunities

4. Risk Assessment
   - Top 3 risks
   - Mitigation strategies

5. Competitive Analysis
   - Known competitors
   - Our competitive advantages
   - Potential weaknesses

6. Action Plan
   - Immediate next steps
   - Key stakeholders to engage
   - Resources needed

7. Deal Stage Assessment
   - Current stage
   - Readiness to advance
   - What's needed to close

Be realistic and data-driven in your forecast.`

    return await this.execute(prompt)
  }

  /**
   * Handle objections
   */
  async handleObjection(objection: string, context?: any): Promise<any> {
    const prompt = `A prospect has raised this objection: "${objection}"

Context:
${context ? JSON.stringify(context, null, 2) : 'No additional context provided'}

Provide:
1. Objection Analysis
   - Root cause of objection
   - What it really means
   - Urgency level

2. Response Strategy
   - Best approach to address
   - Key points to make
   - Evidence to provide

3. Prepared Response
   - Empathetic acknowledgment
   - Reframe the concern
   - Provide solution/answer
   - Call to action

4. Prevention Strategy
   - How to prevent this objection in future
   - Proactive messaging

5. Escalation Path
   - When to involve leadership
   - What resources to leverage

Make the response conversational and persuasive.`

    return await this.execute(prompt)
  }
}
