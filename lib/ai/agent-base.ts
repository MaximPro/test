/**
 * SuperSynergy AI Agent Base Class
 *
 * This is the foundation for all AI agents in the system.
 * Each agent extends this base class and implements specific capabilities.
 */

import { ChatAnthropic } from '@langchain/anthropic'
import { ChatOpenAI } from '@langchain/openai'
import { Ollama } from 'ollama'

export interface AgentConfig {
  name: string
  description: string
  model?: 'anthropic' | 'openai' | 'ollama'
  temperature?: number
  maxTokens?: number
  tools?: AgentTool[]
  memory?: boolean
}

export interface AgentTool {
  name: string
  description: string
  parameters: Record<string, any>
  execute: (input: any) => Promise<any>
}

export interface AgentMessage {
  role: 'system' | 'user' | 'assistant' | 'function'
  content: string
  name?: string
  functionCall?: {
    name: string
    arguments: string
  }
}

export interface AgentResponse {
  content: string
  functionCalls?: Array<{
    name: string
    arguments: any
    result?: any
  }>
  metadata?: Record<string, any>
}

export abstract class AgentBase {
  protected config: AgentConfig
  protected conversationHistory: AgentMessage[] = []
  protected model: any

  constructor(config: AgentConfig) {
    this.config = config
    this.initializeModel()
  }

  private initializeModel() {
    const modelType = this.config.model || process.env.DEFAULT_AI_PROVIDER || 'anthropic'

    switch (modelType) {
      case 'anthropic':
        this.model = new ChatAnthropic({
          modelName: 'claude-sonnet-4-20250514',
          anthropicApiKey: process.env.ANTHROPIC_API_KEY,
          temperature: this.config.temperature || 0.7,
          maxTokens: this.config.maxTokens || 4096,
        })
        break

      case 'openai':
        this.model = new ChatOpenAI({
          modelName: 'gpt-4-turbo-preview',
          openAIApiKey: process.env.OPENAI_API_KEY,
          temperature: this.config.temperature || 0.7,
          maxTokens: this.config.maxTokens || 4096,
        })
        break

      case 'ollama':
        this.model = new Ollama({
          baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
          model: process.env.OLLAMA_MODEL || 'llama3.1:70b',
        })
        break

      default:
        throw new Error(`Unsupported model type: ${modelType}`)
    }
  }

  /**
   * Execute the agent with a given input
   */
  async execute(input: string, context?: Record<string, any>): Promise<AgentResponse> {
    try {
      // Add user message to history
      this.addMessage({ role: 'user', content: input })

      // Get system prompt
      const systemPrompt = this.getSystemPrompt()

      // Prepare messages
      const messages = [
        { role: 'system' as const, content: systemPrompt },
        ...this.conversationHistory,
      ]

      // Execute the model
      const response = await this.model.invoke(messages)

      // Parse response
      const agentResponse: AgentResponse = {
        content: response.content,
        metadata: {
          model: this.config.model,
          timestamp: new Date().toISOString(),
        },
      }

      // Add assistant response to history
      this.addMessage({ role: 'assistant', content: response.content })

      return agentResponse
    } catch (error) {
      console.error(`Agent execution error for ${this.config.name}:`, error)
      throw error
    }
  }

  /**
   * Execute a specific tool
   */
  async executeTool(toolName: string, input: any): Promise<any> {
    const tool = this.config.tools?.find((t) => t.name === toolName)

    if (!tool) {
      throw new Error(`Tool ${toolName} not found`)
    }

    try {
      return await tool.execute(input)
    } catch (error) {
      console.error(`Tool execution error for ${toolName}:`, error)
      throw error
    }
  }

  /**
   * Add a message to conversation history
   */
  protected addMessage(message: AgentMessage) {
    if (this.config.memory) {
      this.conversationHistory.push(message)

      // Keep only last 10 messages to prevent context overflow
      if (this.conversationHistory.length > 10) {
        this.conversationHistory = this.conversationHistory.slice(-10)
      }
    }
  }

  /**
   * Clear conversation history
   */
  clearHistory() {
    this.conversationHistory = []
  }

  /**
   * Get conversation history
   */
  getHistory(): AgentMessage[] {
    return this.conversationHistory
  }

  /**
   * Get the system prompt for this agent
   * Must be implemented by each specific agent
   */
  protected abstract getSystemPrompt(): string

  /**
   * Agent-specific initialization
   */
  protected abstract initialize(): Promise<void>

  /**
   * Agent-specific capabilities
   */
  abstract getCapabilities(): string[]
}
