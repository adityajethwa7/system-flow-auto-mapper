import * as acorn from 'acorn';
import * as walk from 'acorn-walk';

export class ASTParser {
  parseCode(code: string, language: string = 'javascript'): any {
    try {
      if (language === 'javascript' || language === 'typescript') {
        return acorn.parse(code, {
          ecmaVersion: 2022,
          sourceType: 'module',
          allowReturnOutsideFunction: true
        });
      }
      
      // For other languages, we'll implement basic pattern matching
      return this.parseGenericCode(code, language);
    } catch (error) {
      console.error('AST parsing error:', error);
      return null;
    }
  }

  private parseGenericCode(code: string, language: string): any {
    // Simple pattern-based parsing for non-JS languages
    const lines = code.split('\n');
    const functions: any[] = [];
    const classes: any[] = [];
    
    lines.forEach((line, index) => {
      // Detect function definitions
      const functionMatch = line.match(/(?:function|def|func|public|private|protected)?\s*(\w+)\s*\(/);
      if (functionMatch) {
        functions.push({
          name: functionMatch[1],
          line: index + 1,
          type: 'function'
        });
      }
      
      // Detect class definitions
      const classMatch = line.match(/(?:class|interface|struct)\s+(\w+)/);
      if (classMatch) {
        classes.push({
          name: classMatch[1],
          line: index + 1,
          type: 'class'
        });
      }
    });
    
    return { functions, classes, language };
  }

  extractFunctions(ast: any): any[] {
    const functions: any[] = [];
    
    if (ast.functions) {
      return ast.functions; // Generic parsing result
    }
    
    // JavaScript/TypeScript AST traversal
    walk.simple(ast, {
      FunctionDeclaration(node: any) {
        functions.push({
          name: node.id?.name || 'anonymous',
          type: 'function',
          params: node.params.map((p: any) => p.name),
          async: node.async,
          body: node.body
        });
      },
      ArrowFunctionExpression(node: any) {
        functions.push({
          name: 'arrow_function',
          type: 'arrow_function',
          params: node.params.map((p: any) => p.name),
          async: node.async,
          body: node.body
        });
      },
      MethodDefinition(node: any) {
        functions.push({
          name: node.key.name,
          type: 'method',
          params: node.value.params.map((p: any) => p.name),
          async: node.value.async,
          body: node.value.body
        });
      }
    });
    
    return functions;
  }
}