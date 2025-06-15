// import { Server } from '@modelcontextprotocol/sdk/server/index.js';
// import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
// import {
//   CallToolRequestSchema,
//   ListToolsRequestSchema,
// } from '@modelcontextprotocol/sdk/types.js';

// import { ASTParser } from './parsers/ast-parser';
// import { WorkflowDetector } from './analyzers/workflow-detector';
// import { WeaknessFinder } from './analyzers/weakness-finder';
// import { MermaidGenerator } from './generators/mermaid-generator';
// import { AnalysisResult } from './types';

// class SystemFlowAutoMapper {
//   private server: Server;
//   private astParser: ASTParser;
//   private workflowDetector: WorkflowDetector;
//   private weaknessFinder: WeaknessFinder;
//   private mermaidGenerator: MermaidGenerator;

//   constructor() {
//     this.server = new Server(
//       {
//         name: 'system-flow-auto-mapper',
//         version: '1.0.0',
//       },
//       {
//         capabilities: {
//           tools: {},
//         },
//       }
//     );

//     this.astParser = new ASTParser();
//     this.workflowDetector = new WorkflowDetector();
//     this.weaknessFinder = new WeaknessFinder();
//     this.mermaidGenerator = new MermaidGenerator();

//     this.setupHandlers();
//   }

//   private setupHandlers() {
//     this.server.setRequestHandler(ListToolsRequestSchema, async () => {
//       return {
//         tools: [
//           {
//             name: 'analyze_code',
//             description: 'Analyze code and generate workflow diagrams with weakness detection',
//             inputSchema: {
//               type: 'object',
//               properties: {
//                 code: {
//                   type: 'string',
//                   description: 'Source code to analyze'
//                 },
//                 language: {
//                   type: 'string',
//                   description: 'Programming language (javascript, typescript, python, java, etc.)',
//                   default: 'javascript'
//                 },
//                 diagramType: {
//                   type: 'string',
//                   enum: ['flowchart', 'sequence', 'class'],
//                   description: 'Type of diagram to generate',
//                   default: 'flowchart'
//                 }
//               },
//               required: ['code']
//             }
//           },
//           {
//             name: 'generate_mermaid',
//             description: 'Generate Mermaid diagram from analysis results',
//             inputSchema: {
//               type: 'object',
//               properties: {
//                 code: {
//                   type: 'string',
//                   description: 'Source code to analyze'
//                 },
//                 diagramType: {
//                   type: 'string',
//                   enum: ['flowchart', 'sequence', 'class'],
//                   default: 'flowchart'
//                 }
//               },
//               required: ['code']
//             }
//           },
//           {
//             name: 'find_weaknesses',
//             description: 'Find architectural weaknesses and code smells',
//             inputSchema: {
//               type: 'object',
//               properties: {
//                 code: {
//                   type: 'string',
//                   description: 'Source code to analyze for weaknesses'
//                 },
//                 language: {
//                   type: 'string',
//                   description: 'Programming language',
//                   default: 'javascript'
//                 }
//               },
//               required: ['code']
//             }
//           }
//         ]
//       };
//     });

//     this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
//       switch (request.params.name) {
//         case 'analyze_code':
//           return this.handleAnalyzeCode(request.params.arguments);
        
//         case 'generate_mermaid':
//           return this.handleGenerateMermaid(request.params.arguments);
          
//         case 'find_weaknesses':
//           return this.handleFindWeaknesses(request.params.arguments);
          
//         default:
//           throw new Error(`Unknown tool: ${request.params.name}`);
//       }
//     });
//   }

//   private async handleAnalyzeCode(args: any): Promise<any> {
//     console.error(`[SYSTEM-FLOW-DEBUG] Analyze code called with ${args.code?.length} characters`);
//     const { code, language = 'javascript', diagramType = 'flowchart' } = args;
    
//     try {
//       // Parse the code
//       const ast = this.astParser.parseCode(code, language);
//       if (!ast) {
//         throw new Error('Failed to parse code');
//       }
      
//       // Extract functions
//       const functions = this.astParser.extractFunctions(ast);
      
//       // Detect workflows
//       const flows = this.workflowDetector.detectWorkflows(functions, code);
      
//       // Find weaknesses
//       const weaknesses = this.weaknessFinder.findWeaknesses(code, functions);
      
//       // Generate suggestions
//       const suggestions = this.generateSuggestions(flows, weaknesses);
      
//       const result: AnalysisResult = {
//         flows,
//         weaknesses,
//         suggestions
//       };
      
//       return {
//         content: [
//           {
//             type: 'text',
//             text: JSON.stringify(result, null, 2)
//           }
//         ]
//       };
//     } catch (error) {
//       return {
//         content: [
//           {
//             type: 'text',
//             text: `Error analyzing code: ${error instanceof Error ? error.message : 'Unknown error'}`
//           }
//         ]
//       };
//     }
//   }

//   private async handleGenerateMermaid(args: any): Promise<any> {
//     console.error(`[SYSTEM-FLOW-DEBUG] Generate mermaid called`);
//     const { code, diagramType = 'flowchart' } = args;
    
//     try {
//       const ast = this.astParser.parseCode(code);
//       const functions = this.astParser.extractFunctions(ast);
//       const flows = this.workflowDetector.detectWorkflows(functions, code);
      
//       let mermaidCode = '';
      
//       if (flows.length > 0) {
//         switch (diagramType) {
//           case 'flowchart':
//             mermaidCode = this.mermaidGenerator.generateFlowchart(flows[0]);
//             break;
//           case 'sequence':
//             mermaidCode = this.mermaidGenerator.generateSequenceDiagram(flows[0]);
//             break;
//           case 'class':
//             mermaidCode = this.mermaidGenerator.generateClassDiagram(functions);
//             break;
//         }
//       } else {
//         mermaidCode = 'graph TD\n    A[No workflow detected] --> B[Add more structured code]';
//       }
      
//       return {
//         content: [
//           {
//             type: 'text',
//             text: `\`\`\`mermaid\n${mermaidCode}\n\`\`\``
//           }
//         ]
//       };
//     } catch (error) {
//       return {
//         content: [
//           {
//             type: 'text',
//             text: `Error generating diagram: ${error instanceof Error ? error.message : 'Unknown error'}`
//           }
//         ]
//       };
//     }
//   }

//   private async handleFindWeaknesses(args: any): Promise<any> {
//     const { code, language = 'javascript' } = args;
    
//     try {
//       const ast = this.astParser.parseCode(code, language);
//       const functions = this.astParser.extractFunctions(ast);
//       const weaknesses = this.weaknessFinder.findWeaknesses(code, functions);
      
//       const report = {
//         summary: `Found ${weaknesses.length} potential issues`,
//         weaknesses: weaknesses.map(w => ({
//           type: w.type,
//           severity: w.severity,
//           location: w.location,
//           issue: w.description,
//           recommendation: w.suggestion
//         }))
//       };
      
//       return {
//         content: [
//           {
//             type: 'text',
//             text: JSON.stringify(report, null, 2)
//           }
//         ]
//       };
//     } catch (error) {
//       return {
//         content: [
//           {
//             type: 'text',
//             text: `Error finding weaknesses: ${error instanceof Error ? error.message : 'Unknown error'}`
//           }
//         ]
//       };
//     }
//   }

//   private generateSuggestions(flows: any[], weaknesses: any[]): string[] {
//     const suggestions: string[] = [];
    
//     if (flows.length === 0) {
//       suggestions.push('Consider structuring your code with clearer workflow patterns');
//     }
    
//     if (weaknesses.length > 0) {
//       suggestions.push('Address the identified weaknesses to improve code quality');
      
//       const highSeverityCount = weaknesses.filter(w => w.severity === 'high').length;
//       if (highSeverityCount > 0) {
//         suggestions.push(`${highSeverityCount} high-severity issues require immediate attention`);
//       }
//     }
    
//     suggestions.push('Consider adding more error handling and input validation');
//     suggestions.push('Document your workflow patterns for better maintainability');
    
//     return suggestions;
//   }

//   async run() {
//     const transport = new StdioServerTransport();
//     await this.server.connect(transport);
//     console.error('System Flow Auto-Mapper MCP server running on stdio');
//   }
// }

// // Start the server
// const server = new SystemFlowAutoMapper();
// server.run().catch(console.error);
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

class SystemFlowAutoMapper {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'system-flow-auto-mapper',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  private setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      console.error('[DEBUG] ListTools called');
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

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      console.error(`[DEBUG] Tool called: ${request.params.name}`);
      
      if (request.params.name === 'analyze_code') {
        return this.handleAnalyzeCode(request.params.arguments);
      }
      
      throw new Error(`Unknown tool: ${request.params.name}`);
    });
  }

  private async handleAnalyzeCode(args: any): Promise<any> {
    console.error(`[DEBUG] Analyzing code with ${args.code?.length || 0} characters`);
    
    const { code, language = 'javascript' } = args;
    
    try {
      // Simple analysis - detect patterns
      const analysis = this.analyzeCodeSimple(code);
      
      const result = {
        source: "🗺️ System Flow Auto-Mapper MCP Server",
        timestamp: new Date().toISOString(),
        analysis: analysis,
        codeLength: code.length,
        language: language
      };
      
      console.error(`[DEBUG] Analysis complete: ${analysis.weaknesses.length} weaknesses found`);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2)
          }
        ]
      };
    } catch (error) {
      console.error(`[DEBUG] Error in analysis: ${error}`);
      return {
        content: [
          {
            type: 'text',
            text: `❌ Analysis Error: ${error instanceof Error ? error.message : 'Unknown error'}`
          }
        ]
      };
    }
  }

  private analyzeCodeSimple(code: string) {
    const weaknesses = [];
    const workflows = [];
    const functions = [];
    
    // Simple pattern detection
    const functionMatches = code.match(/function\s+(\w+)|const\s+(\w+)\s*=/g) || [];
    functions.push(...functionMatches);
    
    // Check for common issues
    if (!code.includes('try') && !code.includes('catch')) {
      weaknesses.push({
        type: 'missing_error_handling',
        severity: 'high',
        description: 'No error handling detected in code',
        suggestion: 'Add try-catch blocks for error handling'
      });
    }
    
    if (code.includes('SELECT') && code.includes('+')) {
      weaknesses.push({
        type: 'sql_injection',
        severity: 'critical',
        description: 'Potential SQL injection vulnerability detected',
        suggestion: 'Use parameterized queries instead of string concatenation'
      });
    }
    
    if (!code.includes('validate') && !code.includes('check')) {
      weaknesses.push({
        type: 'missing_validation',
        severity: 'medium',
        description: 'No input validation detected',
        suggestion: 'Add input validation for user data'
      });
    }
    
    // Detect workflow patterns
    if (code.includes('login') || code.includes('auth')) {
      workflows.push({
        type: 'authentication_flow',
        description: 'Authentication workflow detected',
        functions: functions.filter(f => /login|auth/i.test(f))
      });
    }
    
    if (code.includes('create') || code.includes('save') || code.includes('insert')) {
      workflows.push({
        type: 'crud_operations',
        description: 'CRUD operations detected',
        functions: functions.filter(f => /create|save|insert|update|delete/i.test(f))
      });
    }
    
    // Generate simple Mermaid diagram
    const mermaidDiagram = this.generateSimpleMermaid(functions, weaknesses);
    
    return {
      functions: functions,
      workflows: workflows,
      weaknesses: weaknesses,
      mermaidDiagram: mermaidDiagram,
      summary: `Found ${functions.length} functions, ${workflows.length} workflows, ${weaknesses.length} issues`
    };
  }
  
  private generateSimpleMermaid(functions: string[], weaknesses: any[]) {
    let mermaid = 'flowchart TD\n';
    
    if (functions.length === 0) {
      return 'flowchart TD\n    A[No functions detected]';
    }
    
    functions.forEach((func, index) => {
      const hasWeakness = weaknesses.length > 0;
      const weaknessSymbol = hasWeakness ? ' ⚠️' : '';
      mermaid += `    F${index}["${func}${weaknessSymbol}"]\n`;
      
      if (index > 0) {
        mermaid += `    F${index - 1} --> F${index}\n`;
      }
    });
    
    if (weaknesses.length > 0) {
      mermaid += '\n    classDef weakness fill:#ffcccc,stroke:#ff0000,stroke-width:2px\n';
      functions.forEach((_, index) => {
        mermaid += `    class F${index} weakness\n`;
      });
    }
    
    return mermaid;
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('✅ System Flow Auto-Mapper MCP server running on stdio');
  }
}

// Start the server
const server = new SystemFlowAutoMapper();
server.run().catch((error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});