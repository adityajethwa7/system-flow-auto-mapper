import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

// Fix: Use .ts extensions for local imports when running with ts-node
import { ASTParser } from './parsers/ast-parser';
import { WorkflowDetector } from './analyzers/workflow-detector';
import { WeaknessFinder } from './analyzers/weakness-finder';
import { MermaidGenerator } from './generators/mermaid-generator';
import { AnalysisResult } from './types';

class SystemFlowAutoMapper {
  private server: Server;
  private astParser: ASTParser;
  private workflowDetector: WorkflowDetector;
  private weaknessFinder: WeaknessFinder;
  private mermaidGenerator: MermaidGenerator;

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

    this.astParser = new ASTParser();
    this.workflowDetector = new WorkflowDetector();
    this.weaknessFinder = new WeaknessFinder();
    this.mermaidGenerator = new MermaidGenerator();

    this.setupHandlers();
  }

  private setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
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

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
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

  private async handleAnalyzeCode(args: any): Promise<any> {
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
      
      const result: AnalysisResult = {
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
    } catch (error) {
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

  private async handleGenerateMermaid(args: any): Promise<any> {
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
      } else {
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
    } catch (error) {
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

  private async handleFindWeaknesses(args: any): Promise<any> {
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
    } catch (error) {
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

  private generateSuggestions(flows: any[], weaknesses: any[]): string[] {
    const suggestions: string[] = [];
    
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
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('System Flow Auto-Mapper MCP server running on stdio');
  }
}

// Start the server
const server = new SystemFlowAutoMapper();
server.run().catch(console.error);