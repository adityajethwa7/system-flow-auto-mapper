const { spawn } = require('child_process');
const readline = require('readline');

const server = spawn('npm', ['run', 'dev:cjs'], {
  stdio: ['pipe', 'pipe', 'inherit']
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔧 MCP Server Interactive Tester');
console.log('Available commands:');
console.log('1. list - List available tools');
console.log('2. analyze - Analyze code');
console.log('3. mermaid - Generate diagram');
console.log('4. quit - Exit\n');

let requestId = 1;

server.stdout.on('data', (data) => {
  const response = data.toString().trim();
  try {
    const parsed = JSON.parse(response);
    console.log('\n📨 Response:', JSON.stringify(parsed, null, 2), '\n');
  } catch (e) {
    console.log('Raw:', response);
  }
});

function askCommand() {
  rl.question('Enter command: ', (cmd) => {
    switch (cmd.trim()) {
      case 'list':
        server.stdin.write(JSON.stringify({
          jsonrpc: "2.0",
          id: requestId++,
          method: "tools/list"
        }) + '\n');
        break;

      case 'analyze':
        rl.question('Enter code to analyze: ', (code) => {
          server.stdin.write(JSON.stringify({
            jsonrpc: "2.0",
            id: requestId++,
            method: "tools/call",
            params: {
              name: "analyze_code",
              arguments: { code, language: "javascript" }
            }
          }) + '\n');
          askCommand();
        });
        return;

      case 'mermaid':
        rl.question('Enter code for diagram: ', (code) => {
          server.stdin.write(JSON.stringify({
            jsonrpc: "2.0",
            id: requestId++,
            method: "tools/call",
            params: {
              name: "generate_mermaid",
              arguments: { code, diagramType: "flowchart" }
            }
          }) + '\n');
          askCommand();
        });
        return;

      case 'quit':
        server.kill();
        process.exit(0);
        return;

      default:
        console.log('Unknown command');
    }
    setTimeout(askCommand, 1000);
  });
}

askCommand();