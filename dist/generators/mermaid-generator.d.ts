import { SystemFlow } from '../types';
export declare class MermaidGenerator {
    generateFlowchart(flow: SystemFlow): string;
    generateSequenceDiagram(flow: SystemFlow): string;
    generateClassDiagram(functions: any[]): string;
    private getNodeShape;
    private extractActors;
    private groupFunctionsByClass;
    private inferClassName;
}
//# sourceMappingURL=mermaid-generator.d.ts.map