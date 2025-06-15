"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ASTParser = void 0;
const acorn = __importStar(require("acorn"));
const walk = __importStar(require("acorn-walk"));
class ASTParser {
    parseCode(code, language = 'javascript') {
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
        }
        catch (error) {
            console.error('AST parsing error:', error);
            return null;
        }
    }
    parseGenericCode(code, language) {
        // Simple pattern-based parsing for non-JS languages
        const lines = code.split('\n');
        const functions = [];
        const classes = [];
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
    extractFunctions(ast) {
        const functions = [];
        if (ast.functions) {
            return ast.functions; // Generic parsing result
        }
        // JavaScript/TypeScript AST traversal
        walk.simple(ast, {
            FunctionDeclaration(node) {
                functions.push({
                    name: node.id?.name || 'anonymous',
                    type: 'function',
                    params: node.params.map((p) => p.name),
                    async: node.async,
                    body: node.body
                });
            },
            ArrowFunctionExpression(node) {
                functions.push({
                    name: 'arrow_function',
                    type: 'arrow_function',
                    params: node.params.map((p) => p.name),
                    async: node.async,
                    body: node.body
                });
            },
            MethodDefinition(node) {
                functions.push({
                    name: node.key.name,
                    type: 'method',
                    params: node.value.params.map((p) => p.name),
                    async: node.value.async,
                    body: node.value.body
                });
            }
        });
        return functions;
    }
}
exports.ASTParser = ASTParser;
//# sourceMappingURL=ast-parser.js.map