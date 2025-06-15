
const { spawn } = require('child_process');
const fs = require('fs');

console.log('\n🎯 HACKATHON DEMO: System Flow Auto-Mapper MCP Server');
console.log('🗺️  Reverse Engineering Code into Workflow Diagrams with AI');
console.log('=' .repeat(70));

// Demo test cases
const demos = [
  {
    title: "🔐 DEMO 1: E-Commerce Authentication System",
    description: "Detecting SQL Injection & Auth Workflow",
    code: `
function loginUser(email, password) {
    console.log("Authenticating user:", email);
    
    // 🚨 SQL INJECTION VULNERABILITY
    const query = "SELECT * FROM users WHERE email = '" + email + "' AND password = '" + password + "'";
    const result = database.execute(query);
    
    if (result.length > 0) {
        const user = result[0];
        
        // 🚨 NO ERROR HANDLING
        const token = generateJWT({
            id: user.id,
            email: user.email,
            role: user.role
        });
        
        return { success: true, token: token, user: user };
    }
    
    return { success: false, message: "Invalid credentials" };
}

function registerUser(email, password, userData) {
    // 🚨 PLAIN TEXT PASSWORD
    const newUser = {
        email: email,
        password: password,  // Should be hashed!
        ...userData,
        createdAt: new Date()
    };
    
    // 🚨 NO INPUT VALIDATION
    const result = database.users.insert(newUser);
    return result;
}
    `
  },
  {
    title: "💰 DEMO 2: Banking Transaction System", 
    description: "Missing Error Handling & Transaction Safety",
    code: `
function transferMoney(fromAccountId, toAccountId, amount) {
    console.log("Transferring $" + amount + " from " + fromAccountId + " to " + toAccountId);
    
    const fromAccount = getAccount(fromAccountId);
    const toAccount = getAccount(toAccountId);
    
    // 🚨 NO BALANCE VALIDATION
    // 🚨 NO TRANSACTION ATOMICITY
    fromAccount.balance -= amount;
    toAccount.balance += amount;
    
    // 🚨 NO ERROR HANDLING - What if one fails?
    updateAccount(fromAccountId, fromAccount);
    updateAccount(toAccountId, toAccount);
    
    const transaction = {
        fromAccount: fromAccountId,
        toAccount: toAccountId,
        amount: amount,
        timestamp: new Date(),
        type: 'transfer'
    };
    
    logTransaction(transaction);
    return { success: true, transactionId: transaction.id };
}

function withdrawCash(accountId, amount, atmId) {
    const account = database.accounts.findById(accountId);
    
    // 🚨 DIRECT BALANCE MODIFICATION
    account.balance = account.balance - amount;
    database.accounts.update(accountId, account);
    
    return { success: true, newBalance: account.balance };
}
    `
  },
  {
    title: "📁 DEMO 3: File Upload System",
    description: "Path Traversal & Security Vulnerabilities", 
    code: `
function uploadFile(req, res) {
    const file = req.file;
    
    // 🚨 NO FILENAME SANITIZATION
    const fileName = file.originalname;
    
    // 🚨 PATH TRAVERSAL VULNERABILITY  
    const filePath = './uploads/' + fileName;
    
    // 🚨 NO FILE TYPE VALIDATION
    // 🚨 NO SIZE LIMITS
    fs.writeFileSync(filePath, file.buffer);
    
    const fileRecord = {
        originalName: fileName,
        filePath: filePath,
        size: file.size,
        uploadedBy: req.user.id,
        uploadedAt: new Date()
    };
    
    const savedFile = database.files.create(fileRecord);
    
    res.json({
        message: 'File uploaded successfully',
        fileId: savedFile.id,
        // 🚨 DIRECT FILE ACCESS
        downloadUrl: '/download/' + savedFile.id
    });
}

function downloadFile(fileId, userId) {
    const file = database.files.findById(fileId);
    
    // 🚨 WEAK AUTHORIZATION
    if (file.uploadedBy !== userId) {
        throw new Error('Unauthorized access');
    }
    
    // 🚨 NO PATH VALIDATION
    const fileContent = fs.readFileSync(file.filePath);
    
    return {
        content: fileContent,
        filename: file.originalName
    };
}
    `
  }
];

let currentDemo = 0;

function runDemo(demo) {
    console.log('\n' + '🎬'.repeat(35));
    console.log(`${demo.title}`);
    console.log(`📝 ${demo.description}`);
    console.log('🎬'.repeat(35));
    
    console.log('\n📋 CODE UNDER ANALYSIS:');
    console.log('─'.repeat(50));
    console.log(demo.code.trim());
    console.log('─'.repeat(50));
    
    console.log('\n🔍 RUNNING AI-POWERED ANALYSIS...\n');
    
    const server = spawn('node', ['dist/index.js'], {
        stdio: ['pipe', 'pipe', 'pipe']
    });
    
    server.stderr.on('data', (data) => {
        if (data.toString().includes('running')) {
            const request = {
                jsonrpc: "2.0",
                id: currentDemo + 1,
                method: "tools/call",
                params: {
                    name: "analyze_code",
                    arguments: {
                        code: demo.code,
                        language: "javascript"
                    }
                }
            };
            
            server.stdin.write(JSON.stringify(request) + '\n');
        }
    });
    
    server.stdout.on('data', (data) => {
        try {
            const response = JSON.parse(data.toString());
            const analysis = JSON.parse(response.result.content[0].text);
            
            displayResults(analysis, demo.title);
            
            server.kill();
            
            // Next demo after 3 seconds
            setTimeout(() => {
                currentDemo++;
                if (currentDemo < demos.length) {
                    runDemo(demos[currentDemo]);
                } else {
                    showFinalSummary();
                }
            }, 3000);
            
        } catch (e) {
            console.log('📤 Raw Analysis Result:', data.toString());
            server.kill();
        }
    });
    
    server.on('error', (error) => {
        console.log('❌ Analysis Error:', error.message);
    });
}

function displayResults(analysis, demoTitle) {
    console.log('✅ ANALYSIS COMPLETE!\n');
    
    // Security Issues
    if (analysis.weaknesses && analysis.weaknesses.length > 0) {
        console.log('🚨 SECURITY VULNERABILITIES DETECTED:');
        console.log('═'.repeat(50));
        
        analysis.weaknesses.forEach((weakness, i) => {
            const severityEmoji = {
                'critical': '🔴',
                'high': '🟠', 
                'medium': '🟡',
                'low': '🟢'
            }[weakness.severity] || '⚪';
            
            console.log(`${i + 1}. ${severityEmoji} ${weakness.type.replace(/_/g, ' ').toUpperCase()} (${weakness.severity.toUpperCase()})`);
            console.log(`   📍 Location: ${weakness.location}`);
            console.log(`   🔍 Issue: ${weakness.description}`);
            console.log(`   💡 Fix: ${weakness.suggestion}\n`);
        });
    }
    
    // Workflow Analysis
    if (analysis.flows && analysis.flows.length > 0) {
        console.log('🔄 WORKFLOW PATTERNS DETECTED:');
        console.log('═'.repeat(50));
        
        analysis.flows.forEach((flow, i) => {
            console.log(`${i + 1}. 📊 ${flow.name}`);
            console.log(`   🏗️  Complexity: ${flow.metadata.complexity.toUpperCase()}`);
            console.log(`   🔧 Patterns: ${flow.metadata.patterns.join(', ')}`);
            console.log(`   📈 Steps: ${flow.steps.length}`);
            
            // Show problematic steps
            const weakSteps = flow.steps.filter(step => step.weaknesses.length > 0);
            if (weakSteps.length > 0) {
                console.log(`   ⚠️  Vulnerable Steps: ${weakSteps.length}/${flow.steps.length}`);
            }
            console.log('');
        });
    }
    
    // Recommendations
    if (analysis.suggestions && analysis.suggestions.length > 0) {
        console.log('💡 AI RECOMMENDATIONS:');
        console.log('═'.repeat(50));
        analysis.suggestions.forEach((suggestion, i) => {
            console.log(`${i + 1}. ${suggestion}`);
        });
        console.log('');
    }
    
    console.log('🎯 DEMO ANALYSIS COMPLETE FOR: ' + demoTitle);
    console.log('⏳ Next demo starting in 3 seconds...\n');
}

function showFinalSummary() {
    console.log('\n' + '🏆'.repeat(35));
    console.log('🎊 HACKATHON DEMO COMPLETE! 🎊');
    console.log('🏆'.repeat(35));
    
    console.log('\n📊 SYSTEM FLOW AUTO-MAPPER CAPABILITIES DEMONSTRATED:');
    console.log('═'.repeat(60));
    console.log('✅ 1. WORKFLOW DETECTION - Authentication, CRUD, Transaction flows');
    console.log('✅ 2. SECURITY ANALYSIS - SQL injection, Path traversal, Missing validation');
    console.log('✅ 3. AI RECOMMENDATIONS - Specific, actionable security improvements');
    console.log('✅ 4. MCP INTEGRATION - Ready for AI assistants like Trae AI');
    console.log('✅ 5. REAL-TIME ANALYSIS - Instant vulnerability detection');
    
    console.log('\n🗺️ UNIQUE VALUE PROPOSITION:');
    console.log('═'.repeat(60));
    console.log('• Goes beyond syntax checking - understands BUSINESS LOGIC');
    console.log('• Detects CONCEPTUAL workflows, not just code structure');
    console.log('• Provides ACTIONABLE security recommendations');
    console.log('• Integrates with AI assistants via MCP protocol');
    console.log('• Real-time reverse engineering into visual diagrams');
    
    console.log('\n🚀 READY FOR PRODUCTION USE!');
    console.log('🔗 Integration: Compatible with Trae AI, Claude Desktop, and MCP ecosystem');
    console.log('📈 Impact: Helps developers identify security issues before they become breaches');
    
    console.log('\n🎯 HACKATHON PROJECT: SYSTEM FLOW AUTO-MAPPER');
    console.log('By: Team DevWings- Reverse Engineering Code with AI');
    console.log('=' .repeat(70));
}

// Start the demo
console.log('\n⏳ Starting comprehensive demo in 3 seconds...');


setTimeout(() => {
    runDemo(demos[0]);
}, 3000);



