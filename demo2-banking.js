// demo2-banking.js
function transferMoney(fromAccountId, toAccountId, amount) {
    const fromAccount = getAccount(fromAccountId);
    const toAccount = getAccount(toAccountId);
    
    // No balance validation!
    fromAccount.balance -= amount;
    toAccount.balance += amount;
    
    // No transaction atomicity!
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
    
    // Direct balance modification without checks
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