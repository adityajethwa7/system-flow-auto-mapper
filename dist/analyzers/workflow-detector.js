"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowDetector = void 0;
class WorkflowDetector {
    detectWorkflows(functions, code) {
        const flows = [];
        // Detect common patterns
        const crudFlow = this.detectCRUDFlow(functions, code);
        if (crudFlow)
            flows.push(crudFlow);
        const authFlow = this.detectAuthFlow(functions, code);
        if (authFlow)
            flows.push(authFlow);
        const requestFlow = this.detectRequestFlow(functions, code);
        if (requestFlow)
            flows.push(requestFlow);
        return flows;
    }
    detectCRUDFlow(functions, code) {
        const crudKeywords = ['create', 'read', 'update', 'delete', 'get', 'post', 'put', 'patch'];
        const crudFunctions = functions.filter(f => crudKeywords.some(keyword => f.name.toLowerCase().includes(keyword)));
        if (crudFunctions.length === 0)
            return null;
        const steps = [];
        const connections = [];
        crudFunctions.forEach((func, index) => {
            const step = {
                id: `crud_${index}`,
                name: func.name,
                type: this.inferStepType(func.name),
                description: `CRUD operation: ${func.name}`,
                weaknesses: this.detectFunctionWeaknesses(func, code)
            };
            steps.push(step);
            if (index > 0) {
                connections.push({
                    from: `crud_${index - 1}`,
                    to: `crud_${index}`,
                    label: 'next'
                });
            }
        });
        return {
            id: 'crud_flow',
            name: 'CRUD Operations Flow',
            steps,
            connections,
            metadata: {
                language: 'javascript',
                patterns: ['CRUD'],
                complexity: 'medium'
            }
        };
    }
    detectAuthFlow(functions, code) {
        const authKeywords = ['login', 'authenticate', 'authorize', 'validate', 'verify', 'token'];
        const authFunctions = functions.filter(f => authKeywords.some(keyword => f.name.toLowerCase().includes(keyword)));
        if (authFunctions.length === 0)
            return null;
        const steps = [
            {
                id: 'auth_input',
                name: 'User Credentials',
                type: 'input',
                description: 'User provides credentials',
                weaknesses: []
            }
        ];
        authFunctions.forEach((func, index) => {
            steps.push({
                id: `auth_${index}`,
                name: func.name,
                type: 'process',
                description: `Authentication step: ${func.name}`,
                weaknesses: this.detectFunctionWeaknesses(func, code)
            });
        });
        const connections = [];
        for (let i = 0; i < steps.length - 1; i++) {
            connections.push({
                from: steps[i].id,
                to: steps[i + 1].id,
                label: 'authenticate'
            });
        }
        return {
            id: 'auth_flow',
            name: 'Authentication Flow',
            steps,
            connections,
            metadata: {
                language: 'javascript',
                patterns: ['Authentication'],
                complexity: 'high'
            }
        };
    }
    detectRequestFlow(functions, code) {
        // Look for request-response patterns
        const requestPattern = /request|req|response|res|middleware|handler/i;
        const requestFunctions = functions.filter(f => requestPattern.test(f.name));
        if (requestFunctions.length === 0)
            return null;
        const steps = [
            {
                id: 'request_start',
                name: 'Incoming Request',
                type: 'input',
                description: 'HTTP request received',
                weaknesses: []
            },
            {
                id: 'request_validate',
                name: 'Validate Request',
                type: 'decision',
                description: 'Validate request parameters',
                weaknesses: this.checkValidationWeaknesses(code)
            },
            {
                id: 'request_process',
                name: 'Process Request',
                type: 'process',
                description: 'Handle business logic',
                weaknesses: []
            },
            {
                id: 'request_response',
                name: 'Send Response',
                type: 'output',
                description: 'Return response to client',
                weaknesses: []
            }
        ];
        const connections = [
            { from: 'request_start', to: 'request_validate', label: 'receive' },
            { from: 'request_validate', to: 'request_process', label: 'valid' },
            { from: 'request_process', to: 'request_response', label: 'complete' }
        ];
        return {
            id: 'request_flow',
            name: 'Request-Response Flow',
            steps,
            connections,
            metadata: {
                language: 'javascript',
                patterns: ['Request-Response'],
                complexity: 'medium'
            }
        };
    }
    inferStepType(functionName) {
        const name = functionName.toLowerCase();
        if (name.includes('get') || name.includes('fetch') || name.includes('read'))
            return 'input';
        if (name.includes('save') || name.includes('store') || name.includes('create'))
            return 'storage';
        if (name.includes('validate') || name.includes('check') || name.includes('verify'))
            return 'decision';
        if (name.includes('send') || name.includes('return') || name.includes('response'))
            return 'output';
        return 'process';
    }
    detectFunctionWeaknesses(func, code) {
        const weaknesses = [];
        // Check for missing error handling
        if (!this.hasErrorHandling(func, code)) {
            weaknesses.push('Missing error handling');
        }
        // Check for missing validation
        if (!this.hasValidation(func, code)) {
            weaknesses.push('Missing input validation');
        }
        return weaknesses;
    }
    hasErrorHandling(func, code) {
        const errorKeywords = ['try', 'catch', 'throw', 'error', 'exception'];
        const funcString = JSON.stringify(func);
        return errorKeywords.some(keyword => funcString.toLowerCase().includes(keyword));
    }
    hasValidation(func, code) {
        const validationKeywords = ['validate', 'check', 'verify', 'assert', 'require'];
        const funcString = JSON.stringify(func);
        return validationKeywords.some(keyword => funcString.toLowerCase().includes(keyword));
    }
    checkValidationWeaknesses(code) {
        const weaknesses = [];
        if (!code.includes('validate') && !code.includes('check')) {
            weaknesses.push('No input validation detected');
        }
        return weaknesses;
    }
}
exports.WorkflowDetector = WorkflowDetector;
//# sourceMappingURL=workflow-detector.js.map