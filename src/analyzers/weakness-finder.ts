import { WeaknessReport } from '../types';

export class WeaknessFinder {
  findWeaknesses(code: string, functions: any[]): WeaknessReport[] {
    const weaknesses: WeaknessReport[] = [];
    
    // Check for missing error handling
    weaknesses.push(...this.findMissingErrorHandling(code, functions));
    
    // Check for missing validation
    weaknesses.push(...this.findMissingValidation(code, functions));
    
    // Check for potential security issues
    weaknesses.push(...this.findSecurityIssues(code));
    
    return weaknesses;
  }

  private findMissingErrorHandling(code: string, functions: any[]): WeaknessReport[] {
    const weaknesses: WeaknessReport[] = [];
    
    functions.forEach(func => {
      const funcString = JSON.stringify(func);
      if (!funcString.includes('try') && !funcString.includes('catch')) {
        weaknesses.push({
          type: 'missing_error_handling',
          severity: 'medium',
          location: func.name,
          description: `Function '${func.name}' lacks error handling`,
          suggestion: 'Add try-catch blocks or error handling logic'
        });
      }
    });
    
    return weaknesses;
  }

  private findMissingValidation(code: string, functions: any[]): WeaknessReport[] {
    const weaknesses: WeaknessReport[] = [];
    
    functions.forEach(func => {
      if (func.params && func.params.length > 0) {
        const funcString = JSON.stringify(func);
        if (!funcString.includes('validate') && !funcString.includes('check')) {
            weaknesses.push({
                type: 'no_validation',
                severity: 'high',
                location: func.name,
                description: `Function '${func.name}' accepts parameters but lacks validation`,
                suggestion: 'Add input validation for parameters'
              });
            }
          }
        });
        
        return weaknesses;
      }
    
      private findSecurityIssues(code: string): WeaknessReport[] {
        const weaknesses: WeaknessReport[] = [];
        
        // Check for SQL injection vulnerabilities
        if (code.includes('SELECT') && code.includes('+')) {
          weaknesses.push({
            type: 'missing_error_handling',
            severity: 'high',
            location: 'SQL Query',
            description: 'Potential SQL injection vulnerability detected',
            suggestion: 'Use parameterized queries or prepared statements'
          });
        }
        
        // Check for hardcoded credentials
        const credentialPatterns = [
          /password\s*=\s*['"][\w]+['"]/i,
          /api_key\s*=\s*['"][\w]+['"]/i,
          /secret\s*=\s*['"][\w]+['"]/i
        ];
        
        credentialPatterns.forEach(pattern => {
          if (pattern.test(code)) {
            weaknesses.push({
              type: 'missing_error_handling',
              severity: 'high',
              location: 'Hardcoded Credentials',
              description: 'Hardcoded credentials detected in code',
              suggestion: 'Move sensitive data to environment variables'
            });
          }
        });
        
        return weaknesses;
      }
    }
          