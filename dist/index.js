"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
// Fix: Use .ts extensions for local imports when running with ts-node
const ast_parser_1 = require("./parsers/ast-parser");
const workflow_detector_1 = require("./analyzers/workflow-detector");
const weakness_finder_1 = require("./analyzers/weakness-finder");
const mermaid_generator_1 = require("./generators/mermaid-generator");
class SystemFlowAutoMapper {
    server;
    astParser;
    workflowDetector;
    weaknessFinder;
    mermaidGenerator;
    constructor() {
        this.server = new index_js_1.Server({
            name: 'system-flow-auto-mapper',
            version: '1.0.0',
        }, {
            capabilities: {
                tools: {},
            },
        });
        this.astParser = new ast_parser_1.ASTParser();
        this.workflowDetector = new workflow_detector_1.WorkflowDetector();
        this.weaknessFinder = new weakness_finder_1.WeaknessFinder();
        this.mermaidGenerator = new mermaid_generator_1.MermaidGenerator();
        this.setupHandlers();
    }
    setupHandlers() {
        this.server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => {
            return {
                tools: [
                    {
                        name: 'analyze_code',
                        description: 'Analyze code and generate workflow diagrams with weakness detection',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                code: {
                                    type: 'string',
                                    description: 'Source code to analyze'
                                },
                                language: {
                                    type: 'string',
                                    description: 'Programming language (javascript, typescript, python, java, etc.)',
                                    default: 'javascript'
                                },
                                diagramType: {
                                    type: 'string',
                                    enum: ['flowchart', 'sequence', 'class'],
                                    description: 'Type of diagram to generate',
                                    default: 'flowchart'
                                }
                            },
                            required: ['code']
                        }
                    },
                    {
                        name: 'generate_mermaid',
                        description: 'Generate Mermaid diagram from analysis results',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                code: {
                                    type: 'string',
                                    description: 'Source code to analyze'
                                },
                                diagramType: {
                                    type: 'string',
                                    enum: ['flowchart', 'sequence', 'class'],
                                    default: 'flowchart'
                                }
                            },
                            required: ['code']
                        }
                    },
                    {
                        name: 'find_weaknesses',
                        description: 'Find architectural weaknesses and code smells',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                code: {
                                    type: 'string',
                                    description: 'Source code to analyze for weaknesses'
                                },
                                language: {
                                    type: 'string',
                                    description: 'Programming language',
                                    default: 'javascript'
                                }
                            },
                            required: ['code']
                        }
                    }
                ]
            };
        });
        this.server.setRequestHandler(types_js_1.CallToolRequestSchema, async (request) => {
            switch (request.params.name) {
                case 'analyze_code':
                    return this.handleAnalyzeCode(request.params.arguments);
                case 'generate_mermaid':
                    return this.handleGenerateMermaid(request.params.arguments);
                case 'find_weaknesses':
                    return this.handleFindWeaknesses(request.params.arguments);
                default:
                    throw new Error(`Unknown tool: ${request.params.name}`);
            }
        });
    }
    async handleAnalyzeCode(args) {
        const { code, language = 'javascript', diagramType = 'flowchart' } = args;
        try {
            // Parse the code
            const ast = this.astParser.parseCode(code, language);
            if (!ast) {
                throw new Error('Failed to parse code');
            }
            // Extract functions
            const functions = this.astParser.extractFunctions(ast);
            // Detect workflows
            const flows = this.workflowDetector.detectWorkflows(functions, code);
            // Find weaknesses
            const weaknesses = this.weaknessFinder.findWeaknesses(code, functions);
            // Generate suggestions
            const suggestions = this.generateSuggestions(flows, weaknesses);
            const result = {
                flows,
                weaknesses,
                suggestions
            };
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(result, null, 2)
                    }
                ]
            };
        }
        catch (error) {
            return {
                content: [
                    {
                        type: 'text',
                        text: `Error analyzing code: ${error instanceof Error ? error.message : 'Unknown error'}`
                    }
                ]
            };
        }
    }
    async handleGenerateMermaid(args) {
        const { code, diagramType = 'flowchart' } = args;
        try {
            const ast = this.astParser.parseCode(code);
            const functions = this.astParser.extractFunctions(ast);
            const flows = this.workflowDetector.detectWorkflows(functions, code);
            let mermaidCode = '';
            if (flows.length > 0) {
                switch (diagramType) {
                    case 'flowchart':
                        mermaidCode = this.mermaidGenerator.generateFlowchart(flows[0]);
                        break;
                    case 'sequence':
                        mermaidCode = this.mermaidGenerator.generateSequenceDiagram(flows[0]);
                        break;
                    case 'class':
                        mermaidCode = this.mermaidGenerator.generateClassDiagram(functions);
                        break;
                }
            }
            else {
                mermaidCode = 'graph TD\n    A[No workflow detected] --> B[Add more structured code]';
            }
            return {
                content: [
                    {
                        type: 'text',
                        text: `\`\`\`mermaid\n${mermaidCode}\n\`\`\``
                    }
                ]
            };
        }
        catch (error) {
            return {
                content: [
                    {
                        type: 'text',
                        text: `Error generating diagram: ${error instanceof Error ? error.message : 'Unknown error'}`
                    }
                ]
            };
        }
    }
    async handleFindWeaknesses(args) {
        const { code, language = 'javascript' } = args;
        try {
            const ast = this.astParser.parseCode(code, language);
            const functions = this.astParser.extractFunctions(ast);
            const weaknesses = this.weaknessFinder.findWeaknesses(code, functions);
            const report = {
                summary: `Found ${weaknesses.length} potential issues`,
                weaknesses: weaknesses.map(w => ({
                    type: w.type,
                    severity: w.severity,
                    location: w.location,
                    issue: w.description,
                    recommendation: w.suggestion
                }))
            };
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(report, null, 2)
                    }
                ]
            };
        }
        catch (error) {
            return {
                content: [
                    {
                        type: 'text',
                        text: `Error finding weaknesses: ${error instanceof Error ? error.message : 'Unknown error'}`
                    }
                ]
            };
        }
    }
    generateSuggestions(flows, weaknesses) {
        const suggestions = [];
        if (flows.length === 0) {
            suggestions.push('Consider structuring your code with clearer workflow patterns');
        }
        if (weaknesses.length > 0) {
            suggestions.push('Address the identified weaknesses to improve code quality');
            const highSeverityCount = weaknesses.filter(w => w.severity === 'high').length;
            if (highSeverityCount > 0) {
                suggestions.push(`${highSeverityCount} high-severity issues require immediate attention`);
            }
        }
        suggestions.push('Consider adding more error handling and input validation');
        suggestions.push('Document your workflow patterns for better maintainability');
        return suggestions;
    }
    async run() {
        const transport = new stdio_js_1.StdioServerTransport();
        await this.server.connect(transport);
        console.error('System Flow Auto-Mapper MCP server running on stdio');
    }
}
// Start the server
const server = new SystemFlowAutoMapper();
server.run().catch(console.error);
//# sourceMappingURL=index.js.map