const { spawn } = require('child_process');

// Test with multiple code samples
const testCodes = [
  {
    name: "E-commerce Checkout",
    code: `
function processCheckout(userId, cartItems, paymentInfo) {
  const user = database.users.findById(userId);
  const total = calculateTotal(cartItems);
  
  const payment = paymentGateway.charge({
    amount: total,
    card: paymentInfo.cardNumber,
    cvv: paymentInfo.cvv
  });
  
  if (payment.success) {
    const order = {
      userId: userId,
      items: cartItems,
      total: total,
      status: 'completed'
    };
    
    database.orders.create(order);
    emailService.sendReceipt(user.email, order);
    return { success: true, orderId: order.id };
  }
  
  return { success: false, error: payment.error };
}

function addToCart(userId, productId, quantity) {
  const product = database.products.findById(productId);
  const cartItem = {
    productId: productId,
    quantity: quantity,
    price: product.price
  };
  
  database.cart.add(userId, cartItem);
  return cartItem;
}
`
  },
  {
    name: "User Authentication System",
    code: `
function registerUser(email, password, userData) {
  const existingUser = database.query("SELECT * FROM users WHERE email = '" + email + "'");
  
  if (existingUser.length > 0) {
    throw new Error("User already exists");
  }
  
  const hashedPassword = bcrypt.hash(password, 10);
  const newUser = {
    email: email,
    password: hashedPassword,
    ...userData,
    createdAt: new Date()
  };
  
  const result = database.users.insert(newUser);
  sendWelcomeEmail(email);
  
  return result;
}

function loginUser(email, password) {
  const query = "SELECT * FROM users WHERE email = '" + email + "'";
  const user = database.execute(query)[0];
  
  if (user && bcrypt.compare(password, user.password)) {
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
    return { success: true, token: token, user: user };
  }
  
  return { success: false, message: "Invalid credentials" };
}

function resetPassword(email) {
  const user = findUserByEmail(email);
  const resetToken = generateResetToken();
  
  database.passwordResets.create({
    userId: user.id,
    token: resetToken,
    expiresAt: new Date(Date.now() + 3600000)
  });
  
  emailService.sendPasswordReset(email, resetToken);
}
`
  },
  {
    name: "File Upload System",
    code: `
function uploadFile(req, res) {
  const file = req.file;
  const fileName = file.originalname;
  const filePath = './uploads/' + fileName;
  
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
    downloadUrl: '/download/' + savedFile.id
  });
}

function downloadFile(fileId, userId) {
  const file = database.files.findById(fileId);
  
  if (file.uploadedBy !== userId) {
    throw new Error('Unauthorized access');
  }
  
  const fileContent = fs.readFileSync(file.filePath);
  return {
    content: fileContent,
    filename: file.originalName,
    contentType: getContentType(file.originalName)
  };
}
`
  },
  {
    name: "Banking Transaction System",
    code: `
function transferMoney(fromAccountId, toAccountId, amount) {
  const fromAccount = getAccount(fromAccountId);
  const toAccount = getAccount(toAccountId);
  
  if (fromAccount.balance < amount) {
    return { success: false, error: 'Insufficient funds' };
  }
  
  fromAccount.balance -= amount;
  toAccount.balance += amount;
  
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
  
  if (account.balance >= amount) {
    account.balance = account.balance - amount;
    database.accounts.update(accountId, account);
    
    createTransaction({
      accountId: accountId,
      type: 'withdrawal',
      amount: amount,
      location: atmId
    });
    
    return { success: true, newBalance: account.balance };
  }
  
  return { success: false, reason: 'Insufficient funds' };
}
`
  }
];

function testWithCode(testCase, index) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🧪 TEST ${index + 1}: ${testCase.name}`);
  console.log(`${'='.repeat(60)}`);

  const server = spawn('node', ['./dist/index.js'], {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  const request = {
    jsonrpc: "2.0",
    id: index + 1,
    method: "tools/call",
    params: {
      name: "analyze_code",
      arguments: {
        code: testCase.code,
        language: "javascript"
      }
    }
  };

  console.log(`📤 Sending request for ${testCase.name}...`);
  server.stdin.write(JSON.stringify(request) + '\n');

  let responseReceived = false;

  server.stdout.on('data', (data) => {
    responseReceived = true;
    console.log(`\n✅ RESPONSE for ${testCase.name}:`);
    console.log('-'.repeat(50));
    
    try {
      const response = JSON.parse(data.toString());
      if (response.result && response.result.content) {
        console.log(response.result.content[0].text);
      } else {
        console.log('Raw response:', data.toString());
      }
    } catch (e) {
      console.log('Raw response:', data.toString());
    }
    
    server.kill();
    
    // Run next test after delay
    if (index < testCodes.length - 1) {
      setTimeout(() => testWithCode(testCodes[index + 1], index + 1), 2000);
    } else {
      console.log(`\n${'🎉'.repeat(20)}`);
      console.log('🏁 ALL TESTS COMPLETED!');
      console.log(`${'🎉'.repeat(20)}\n`);
    }
  });

  server.stderr.on('data', (data) => {
    console.log('📋 Server log:', data.toString().trim());
  });

  server.on('error', (error) => {
    console.log(`❌ Error in ${testCase.name}:`, error.message);
  });

  setTimeout(() => {
    if (!responseReceived) {
      console.log(`❌ No response received for ${testCase.name}`);
      server.kill();
    }
  }, 5000);
}

// Start testing
console.log('🚀 Testing System Flow Auto-Mapper MCP Server');
console.log('🔍 Running comprehensive tests with various code samples...\n');

testWithCode(testCodes[0], 0);