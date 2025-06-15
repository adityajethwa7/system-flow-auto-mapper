export interface WorkflowStep {
    id: string;
    name: string;
    type: 'input' | 'process' | 'decision' | 'output' | 'storage';
    description: string;
    weaknesses: string[];
}
export interface SystemFlow {
    id: string;
    name: string;
    steps: WorkflowStep[];
    connections: FlowConnection[];
    metadata: FlowMetadata;
}
export interface FlowConnection {
    from: string;
    to: string;
    condition?: string;
    label?: string;
}
export interface FlowMetadata {
    language: string;
    framework?: string;
    patterns: string[];
    complexity: 'low' | 'medium' | 'high';
}
export interface AnalysisResult {
    flows: SystemFlow[];
    weaknesses: WeaknessReport[];
    suggestions: string[];
}
export interface WeaknessReport {
    type: 'missing_error_handling' | 'no_validation' | 'circular_dependency' | 'dead_code';
    severity: 'low' | 'medium' | 'high';
    location: string;
    description: string;
    suggestion: string;
}
//# sourceMappingURL=index.d.ts.map