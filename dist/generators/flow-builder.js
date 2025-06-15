"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlowBuilder = void 0;
class FlowBuilder {
    buildFlow(id, name, steps, connections) {
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
    calculateComplexity(steps, connections) {
        const totalElements = steps.length + connections.length;
        if (totalElements <= 5)
            return 'low';
        if (totalElements <= 10)
            return 'medium';
        return 'high';
    }
    addStep(flow, step) {
        return {
            ...flow,
            steps: [...flow.steps, step]
        };
    }
    addConnection(flow, connection) {
        return {
            ...flow,
            connections: [...flow.connections, connection]
        };
    }
}
exports.FlowBuilder = FlowBuilder;
//# sourceMappingURL=flow-builder.js.map