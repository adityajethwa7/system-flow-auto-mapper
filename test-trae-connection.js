const { spawn } = require('child_process');

console.log('🔍 Testing if Trae AI can connect to your MCP server...\n');

// Simulate how Trae AI connects to your server
const server = spawn('node', ['/Library/aditya/Hackathons/TRAE-AI/system-flow-auto-mapper/dist/index.js'], {
  stdio: ['pipe', 'pipe', 'pipe'],
  env: process.env
});

console.log('📡 Server PID:', server.pid);

server.stderr.on('data', (data) => {
  console.log('🟢 Server ready:', data.toString().trim());
});

// Test the exact sequence Trae AI would use
setTimeout(() => {
  console.log('📋 Testing tools list (what Trae AI does first)...');
  
  const listRequest = {
    jsonrpc: "2.0",
    id: 1,
    method: "tools/list"
  };
  
  server.stdin.write(JSON.stringify(listRequest) + '\n');
}, 1000);

setTimeout(() => {
  console.log('🔍 Testing code analysis (what Trae AI does next)...');
  
  const analyzeRequest = {
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "analyze_code",
      arguments: {
        code: "function test() { const sql = \"SELECT * FROM users WHERE id = \" + userId; return db.query(sql); }",
        language: "javascript"
      }
    }
  };
  
  server.stdin.write(JSON.stringify(analyzeRequest) + '\n');
}, 2000);

server.stdout.on('data', (data) => {
  try {
    const response = JSON.parse(data.toString());
    if (response.id === 1) {
      console.log('✅ Tools list successful - Found tools:', response.result.tools.map(t => t.name));
    } else if (response.id === 2) {
      console.log('✅ Code analysis successful!');
      console.log('🎯 Found vulnerabilities in response:', data.toString().includes('SQL injection'));
    }
    console.log('');
  } catch (e) {
    console.log('📤 Raw response:', data.toString());
  }
});

setTimeout(() => {
  console.log('🏁 Connection test complete');
  server.kill();
}, 5000);