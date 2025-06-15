import { SystemFlow, WorkflowStep, FlowConnection } from '../types';

export class FlowBuilder {
  buildFlow(id: string, name: string, steps: WorkflowStep[], connections: FlowConnection[]): SystemFlow {
    return {
      id,
      name,
      steps,
      connections,
      metadata: {
        language: 'javascript',
        patterns: [name],
        complexity: this.calculateComplexity(steps, connections)
      }
    };
  }

  private calculateComplexity(steps: WorkflowStep[], connections: FlowConnection[]): 'low' | 'medium' | 'high' {
    const totalElements = steps.length + connections.length;
    
    if (totalElements <= 5) return 'low';
    if (totalElements <= 10) return 'medium';
    return 'high';
  }

  addStep(flow: SystemFlow, step: WorkflowStep): SystemFlow {
    return {
      ...flow,
      steps: [...flow.steps, step]
    };
  }

  addConnection(flow: SystemFlow, connection: FlowConnection): SystemFlow {
    return {
      ...flow,
      connections: [...flow.connections, connection]
    };
  }
}