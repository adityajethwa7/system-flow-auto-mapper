const { spawn } = require('child_process');

// Start the MCP server
const server = spawn('npm', ['run', 'dev:cjs'], {
  stdio: ['pipe', 'pipe', 'inherit']
});

console.log('🚀 Testing MCP Server...\n');

// Test 1: List available tools
const listToolsRequest = {
  jsonrpc: "2.0",
  id: 1,
  method: "tools/list"
};

console.log('📋 Requesting available tools...');
server.stdin.write(JSON.stringify(listToolsRequest) + '\n');

// Test 2: Analyze some code
setTimeout(() => {
  const analyzeRequest = {
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "analyze_code",
      arguments: {
        code: `
function loginUser(username, password) {
  const user = database.findUser(username);
  if (user.password === password) {
    return generateToken(user);
  }
  return null;
}

function createPost(title, content, userId) {
  const post = { title, content, userId, createdAt: new Date() };
  return database.savePost(post);
}
        `,
        language: "javascript"
      }
    }
  };

  console.log('\n🔍 Analyzing code...');
  server.stdin.write(JSON.stringify(analyzeRequest) + '\n');
}, 1000);

// Test 3: Generate Mermaid diagram
setTimeout(() => {
  const mermaidRequest = {
    jsonrpc: "2.0",
    id: 3,
    method: "tools/call",
    params: {
      name: "generate_mermaid",
      arguments: {
        code: `
function processOrder(order) {
  validateOrder(order);
  const payment = processPayment(order.total);
  if (payment.success) {
    saveOrder(order);
    sendConfirmation(order.email);
  }
  return payment;
}
        `,
        diagramType: "flowchart"
      }
    }
  };

  console.log('\n🎨 Generating Mermaid diagram...');
  server.stdin.write(JSON.stringify(mermaidRequest) + '\n');
}, 2000);

// Listen for responses
server.stdout.on('data', (data) => {
  const response = data.toString().trim();
  
  try {
    const parsed = JSON.parse(response);
    console.log('\n✅ Server Response:');
    console.log('ID:', parsed.id);
    
    if (parsed.result && parsed.result.content) {
      console.log('Content:', parsed.result.content[0].text);
    } else if (parsed.result && parsed.result.tools) {
      console.log('Available Tools:', parsed.result.tools.map(t => t.name));
    }
    console.log('\n' + '='.repeat(50));
  } catch (e) {
    console.log('Raw response:', response);
  }
});

// Cleanup after 5 seconds
setTimeout(() => {
  console.log('\n🏁 Test completed!');
  server.kill();
  process.exit(0);
}, 5000);