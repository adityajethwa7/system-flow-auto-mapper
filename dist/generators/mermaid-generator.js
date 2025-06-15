"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MermaidGenerator = void 0;
class MermaidGenerator {
    generateFlowchart(flow) {
        let mermaid = 'flowchart TD\n';
        // Add nodes
        flow.steps.forEach(step => {
            const nodeShape = this.getNodeShape(step.type);
            const weaknessIndicator = step.weaknesses.length > 0 ? ' ⚠️' : '';
            mermaid += `    ${step.id}${nodeShape.start}"${step.name}${weaknessIndicator}"${nodeShape.end}\n`;
        });
        mermaid += '\n';
        // Add connections
        flow.connections.forEach(conn => {
            const label = conn.label ? `|${conn.label}|` : '';
            mermaid += `    ${conn.from} -->${label} ${conn.to}\n`;
        });
        // Add styling for weaknesses
        const weakSteps = flow.steps.filter(s => s.weaknesses.length > 0);
        if (weakSteps.length > 0) {
            mermaid += '\n    %% Styling for weaknesses\n';
            weakSteps.forEach(step => {
                mermaid += `    classDef weakness fill:#ffcccc,stroke:#ff0000,stroke-width:2px\n`;
                mermaid += `    class ${step.id} weakness\n`;
            });
        }
        return mermaid;
    }
    generateSequenceDiagram(flow) {
        let mermaid = 'sequenceDiagram\n';
        const actors = this.extractActors(flow);
        actors.forEach(actor => {
            mermaid += `    participant ${actor}\n`;
        });
        mermaid += '\n';
        // Generate sequence based on flow connections
        flow.connections.forEach(conn => {
            const fromStep = flow.steps.find(s => s.id === conn.from);
            const toStep = flow.steps.find(s => s.id === conn.to);
            if (fromStep && toStep) {
                const message = conn.label || toStep.name;
                mermaid += `    ${fromStep.name}->>${toStep.name}: ${message}\n`;
            }
        });
        return mermaid;
    }
    generateClassDiagram(functions) {
        let mermaid = 'classDiagram\n';
        // Group functions by their likely classes/modules
        const classes = this.groupFunctionsByClass(functions);
        Object.entries(classes).forEach(([className, classFunctions]) => {
            mermaid += `    class ${className} {\n`;
            classFunctions.forEach(func => {
                const params = func.params ? func.params.join(', ') : '';
                mermaid += `        +${func.name}(${params})\n`;
            });
            mermaid += '    }\n\n';
        });
        return mermaid;
    }
    getNodeShape(type) {
        switch (type) {
            case 'input':
                return { start: '[', end: ']' };
            case 'decision':
                return { start: '{', end: '}' };
            case 'process':
                return { start: '[', end: ']' };
            case 'storage':
                return { start: '[(', end: ')]' };
            case 'output':
                return { start: '[', end: ']' };
            default:
                return { start: '[', end: ']' };
        }
    }
    extractActors(flow) {
        const actors = new Set();
        flow.steps.forEach(step => {
            if (step.type === 'input')
                actors.add('Client');
            if (step.type === 'storage')
                actors.add('Database');
            if (step.type === 'output')
                actors.add('Response');
            actors.add('System');
        });
        return Array.from(actors);
    }
    groupFunctionsByClass(functions) {
        const classes = {};
        functions.forEach(func => {
            // Try to infer class name from function name
            const className = this.inferClassName(func.name);
            if (!classes[className]) {
                classes[className] = [];
            }
            classes[className].push(func);
        });
        return classes;
    }
    inferClassName(functionName) {
        // Simple heuristic to group functions
        if (functionName.toLowerCase().includes('user'))
            return 'UserService';
        if (functionName.toLowerCase().includes('auth'))
            return 'AuthService';
        if (functionName.toLowerCase().includes('data') || functionName.toLowerCase().includes('db'))
            return 'DataService';
        if (functionName.toLowerCase().includes('api') || functionName.toLowerCase().includes('request'))
            return 'ApiController';
        return 'MainService';
    }
}
exports.MermaidGenerator = MermaidGenerator;
//# sourceMappingURL=mermaid-generator.js.map