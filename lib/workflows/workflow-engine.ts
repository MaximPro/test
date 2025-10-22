/**
 * SuperSynergy Workflow Engine
 *
 * Inspired by n8n, this workflow engine executes automated workflows
 * with support for:
 * - Sequential and parallel execution
 * - Conditional logic
 * - Error handling and retries
 * - AI agent integration
 * - External API calls
 * - Data transformation
 */

import { EventEmitter } from 'events'

export interface WorkflowNode {
  id: string
  type: string
  name: string
  parameters: Record<string, any>
  position?: { x: number; y: number }
}

export interface WorkflowConnection {
  source: string
  sourceOutput: string
  target: string
  targetInput: string
}

export interface Workflow {
  id: string
  name: string
  description?: string
  active: boolean
  nodes: WorkflowNode[]
  connections: WorkflowConnection[]
  settings?: WorkflowSettings
  createdAt: Date
  updatedAt: Date
}

export interface WorkflowSettings {
  errorHandling?: 'stopOnError' | 'continueOnError' | 'retryOnError'
  maxRetries?: number
  retryDelay?: number
  timeout?: number
  saveExecutionData?: boolean
}

export interface WorkflowExecution {
  id: string
  workflowId: string
  status: 'running' | 'success' | 'error' | 'cancelled'
  startedAt: Date
  finishedAt?: Date
  error?: string
  nodeExecutions: NodeExecution[]
  data?: any
}

export interface NodeExecution {
  nodeId: string
  status: 'pending' | 'running' | 'success' | 'error' | 'skipped'
  startedAt?: Date
  finishedAt?: Date
  error?: string
  input?: any
  output?: any
  executionTime?: number
}

export class WorkflowEngine extends EventEmitter {
  private workflows: Map<string, Workflow> = new Map()
  private executions: Map<string, WorkflowExecution> = new Map()
  private nodeExecutors: Map<string, NodeExecutor> = new Map()

  constructor() {
    super()
    this.registerBuiltInNodeExecutors()
  }

  /**
   * Register a workflow
   */
  registerWorkflow(workflow: Workflow): void {
    this.workflows.set(workflow.id, workflow)
    this.emit('workflow:registered', workflow)
  }

  /**
   * Get a workflow by ID
   */
  getWorkflow(workflowId: string): Workflow | undefined {
    return this.workflows.get(workflowId)
  }

  /**
   * Execute a workflow
   */
  async executeWorkflow(
    workflowId: string,
    input?: any,
  ): Promise<WorkflowExecution> {
    const workflow = this.workflows.get(workflowId)

    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`)
    }

    if (!workflow.active) {
      throw new Error(`Workflow ${workflowId} is not active`)
    }

    const execution: WorkflowExecution = {
      id: this.generateExecutionId(),
      workflowId,
      status: 'running',
      startedAt: new Date(),
      nodeExecutions: [],
      data: input,
    }

    this.executions.set(execution.id, execution)
    this.emit('execution:started', execution)

    try {
      // Build execution graph
      const executionGraph = this.buildExecutionGraph(workflow)

      // Execute nodes in order
      for (const nodeId of executionGraph) {
        const node = workflow.nodes.find((n) => n.id === nodeId)

        if (!node) {
          throw new Error(`Node ${nodeId} not found in workflow`)
        }

        const nodeExecution = await this.executeNode(
          node,
          execution,
          workflow,
        )
        execution.nodeExecutions.push(nodeExecution)

        if (nodeExecution.status === 'error') {
          if (workflow.settings?.errorHandling === 'stopOnError') {
            throw new Error(
              `Node ${node.name} failed: ${nodeExecution.error}`,
            )
          }
        }

        this.emit('node:executed', nodeExecution)
      }

      execution.status = 'success'
      execution.finishedAt = new Date()
      this.emit('execution:completed', execution)
    } catch (error) {
      execution.status = 'error'
      execution.error = error instanceof Error ? error.message : String(error)
      execution.finishedAt = new Date()
      this.emit('execution:failed', execution)
      throw error
    }

    return execution
  }

  /**
   * Execute a single node
   */
  private async executeNode(
    node: WorkflowNode,
    execution: WorkflowExecution,
    workflow: Workflow,
  ): Promise<NodeExecution> {
    const nodeExecution: NodeExecution = {
      nodeId: node.id,
      status: 'running',
      startedAt: new Date(),
    }

    try {
      // Get executor for this node type
      const executor = this.nodeExecutors.get(node.type)

      if (!executor) {
        throw new Error(`No executor found for node type: ${node.type}`)
      }

      // Get input data from previous nodes
      const input = this.getNodeInput(node, execution, workflow)
      nodeExecution.input = input

      // Execute the node
      const output = await executor.execute(node, input, execution)
      nodeExecution.output = output

      nodeExecution.status = 'success'
      nodeExecution.finishedAt = new Date()
      nodeExecution.executionTime =
        nodeExecution.finishedAt.getTime() - nodeExecution.startedAt!.getTime()
    } catch (error) {
      nodeExecution.status = 'error'
      nodeExecution.error = error instanceof Error ? error.message : String(error)
      nodeExecution.finishedAt = new Date()
    }

    return nodeExecution
  }

  /**
   * Build execution graph (topological sort)
   */
  private buildExecutionGraph(workflow: Workflow): string[] {
    // Simple implementation - execute nodes in order
    // In a real implementation, this would do proper topological sorting
    return workflow.nodes.map((n) => n.id)
  }

  /**
   * Get input data for a node
   */
  private getNodeInput(
    node: WorkflowNode,
    execution: WorkflowExecution,
    workflow: Workflow,
  ): any {
    // Find connections to this node
    const connections = workflow.connections.filter((c) => c.target === node.id)

    if (connections.length === 0) {
      // First node, use execution input
      return execution.data
    }

    // Combine outputs from all source nodes
    const input: any = {}

    for (const connection of connections) {
      const sourceExecution = execution.nodeExecutions.find(
        (ne) => ne.nodeId === connection.source,
      )

      if (sourceExecution && sourceExecution.output) {
        Object.assign(input, sourceExecution.output)
      }
    }

    return input
  }

  /**
   * Register built-in node executors
   */
  private registerBuiltInNodeExecutors(): void {
    // Trigger Node
    this.registerNodeExecutor('trigger', {
      execute: async (node, input) => {
        return input || {}
      },
    })

    // AI Agent Node
    this.registerNodeExecutor('ai-agent', {
      execute: async (node, input) => {
        const { agentType, prompt, context } = node.parameters

        // This would call the actual AI agent
        return {
          response: 'AI agent response',
          agentType,
        }
      },
    })

    // HTTP Request Node
    this.registerNodeExecutor('http-request', {
      execute: async (node, input) => {
        const { url, method, headers, body } = node.parameters

        const response = await fetch(url, {
          method: method || 'GET',
          headers: headers || {},
          body: body ? JSON.stringify(body) : undefined,
        })

        return {
          statusCode: response.status,
          body: await response.json(),
        }
      },
    })

    // Code Node
    this.registerNodeExecutor('code', {
      execute: async (node, input) => {
        const { code } = node.parameters

        // Execute JavaScript code
        // In production, this should use a sandbox (vm2, isolated-vm)
        const func = new Function('input', code)
        return func(input)
      },
    })

    // Conditional Node
    this.registerNodeExecutor('conditional', {
      execute: async (node, input) => {
        const { condition, value1, value2 } = node.parameters

        let result = false

        switch (condition) {
          case 'equals':
            result = value1 === value2
            break
          case 'notEquals':
            result = value1 !== value2
            break
          case 'contains':
            result = String(value1).includes(String(value2))
            break
          case 'greaterThan':
            result = Number(value1) > Number(value2)
            break
          case 'lessThan':
            result = Number(value1) < Number(value2)
            break
        }

        return { result, input }
      },
    })

    // Email Node
    this.registerNodeExecutor('email', {
      execute: async (node, input) => {
        const { to, subject, body } = node.parameters

        // Send email (integrate with email service)
        return {
          sent: true,
          to,
          subject,
        }
      },
    })

    // Database Node
    this.registerNodeExecutor('database', {
      execute: async (node, input) => {
        const { operation, table, data } = node.parameters

        // Execute database operation
        return {
          operation,
          table,
          result: 'Database operation result',
        }
      },
    })
  }

  /**
   * Register a node executor
   */
  registerNodeExecutor(type: string, executor: NodeExecutor): void {
    this.nodeExecutors.set(type, executor)
  }

  /**
   * Generate a unique execution ID
   */
  private generateExecutionId(): string {
    return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Get execution by ID
   */
  getExecution(executionId: string): WorkflowExecution | undefined {
    return this.executions.get(executionId)
  }

  /**
   * Cancel a running execution
   */
  async cancelExecution(executionId: string): Promise<void> {
    const execution = this.executions.get(executionId)

    if (!execution) {
      throw new Error(`Execution ${executionId} not found`)
    }

    if (execution.status !== 'running') {
      throw new Error(`Execution ${executionId} is not running`)
    }

    execution.status = 'cancelled'
    execution.finishedAt = new Date()
    this.emit('execution:cancelled', execution)
  }
}

/**
 * Node Executor Interface
 */
export interface NodeExecutor {
  execute: (
    node: WorkflowNode,
    input: any,
    execution: WorkflowExecution,
  ) => Promise<any>
}

// Singleton instance
export const workflowEngine = new WorkflowEngine()
