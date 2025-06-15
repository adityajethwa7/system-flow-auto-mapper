import { SystemFlow, WorkflowStep, FlowConnection } from '../types';
export declare class FlowBuilder {
    buildFlow(id: string, name: string, steps: WorkflowStep[], connections: FlowConnection[]): SystemFlow;
    private calculateComplexity;
    addStep(flow: SystemFlow, step: WorkflowStep): SystemFlow;
    addConnection(flow: SystemFlow, connection: FlowConnection): SystemFlow;
}
//# sourceMappingURL=flow-builder.d.ts.map