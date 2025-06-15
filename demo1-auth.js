// demo1-auth.js
function loginUser(email, password) {
    const query = "SELECT * FROM users WHERE email = '" + email + "' AND password = '" + password + "'";
    const result = database.execute(query);
    
    if (result.length > 0) {
        const user = result[0];
        const token = generateJWT({
            id: user.id,
            email: user.email,
            role: user.role
        });
        
        return {
            success: true,
            token: token,
            user: {
                id: user.id,
                email: user.email
            }
        };
    }
    
    return { success: false, message: "Invalid credentials" };
}

function registerUser(email, password, userData) {
    const existingUser = database.query("SELECT * FROM users WHERE email = '" + email + "'");
    
    if (existingUser.length > 0) {
        throw new Error("User already exists");
    }
    
    const newUser = {
        email: email,
        password: password, // Plain text password!
        ...userData,
        createdAt: new Date()
    };
    
    const result = database.users.insert(newUser);
    sendWelcomeEmail(email);
    
    return result;
}