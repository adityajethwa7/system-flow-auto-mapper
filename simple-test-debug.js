const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Testing simplified MCP server...\n');

const serverPath = path.join(__dirname, 'dist', 'index.js');
console.log('Server path:', serverPath);

const server = spawn('node', [serverPath], {
  stdio: ['pipe', 'pipe', 'pipe']
});

let serverStarted = false;

server.stderr.on('data', (data) => {
  const output = data.toString();
  console.log('📋 Server log:', output.trim());
  
  if (output.includes('running on stdio')) {
    serverStarted = true;
    console.log('✅ Server started successfully!\n');
    
    // Test 1: List tools
    console.log('📋 Testing list tools...');
    const listRequest = {
      jsonrpc: "2.0",
      id: 1,
      method: "tools/list"
    };
    
    server.stdin.write(JSON.stringify(listRequest) + '\n');
    
    // Test 2: Analyze code after delay
    setTimeout(() => {
      console.log('🔍 Testing code analysis...');
      const analyzeRequest = {
        jsonrpc: "2.0",
        id: 2,
        method: "tools/call",
        params: {
          name: "analyze_code",
          arguments: {
            code: `
function login(user, pass) {
  const query = "SELECT * FROM users WHERE name = '" + user + "'";
  const result = db.execute(query);
  return result[0];
}
            `.trim(),
            language: "javascript"
          }
        }
      };
      
      server.stdin.write(JSON.stringify(analyzeRequest) + '\n');
    }, 1000);
  }
});

server.stdout.on('data', (data) => {
  console.log('📤 Server response:');
  console.log(data.toString());
  console.log('\n' + '='.repeat(50) + '\n');
});

server.on('error', (error) => {
  console.log('❌ Server error:', error.message);
});

setTimeout(() => {
  if (!serverStarted) {
    console.log('❌ Server failed to start within 5 seconds');
  }
  server.kill();
  process.exit(0);
}, 10000);