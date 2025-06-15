import { SystemFlow } from '../types';
export declare class WorkflowDetector {
    detectWorkflows(functions: any[], code: string): SystemFlow[];
    private detectCRUDFlow;
    private detectAuthFlow;
    private detectRequestFlow;
    private inferStepType;
    private detectFunctionWeaknesses;
    private hasErrorHandling;
    private hasValidation;
    private checkValidationWeaknesses;
}
//# sourceMappingURL=workflow-detector.d.ts.map