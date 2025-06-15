const { spawn } = require('child_process');

const server = spawn('node', ['./dist/index.js'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

const simpleCode = `
function login(username, password) {
  const user = database.query("SELECT * FROM users WHERE name = '" + username + "'");
  if (user[0].password === password) {
    return generateToken(user[0]);
  }
  throw new Error('Invalid login');
}
`;

const request = {
  jsonrpc: "2.0",
  id: 1,
  method: "tools/call",
  params: {
    name: "analyze_code",
    arguments: {
      code: simpleCode,
      language: "javascript"
    }
  }
};

console.log('🧪 Quick test with simple login function...\n');

server.stdin.write(JSON.stringify(request) + '\n');

server.stdout.on('data', (data) => {
  console.log('✅ Server Response:');
  console.log(data.toString());
  server.kill();
});

server.stderr.on('data', (data) => {
  console.log('📋 Server says:', data.toString());
});

setTimeout(() => {
  console.log('❌ Test timeout');
  server.kill();
}, 3000);