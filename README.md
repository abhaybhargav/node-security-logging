# Security Logging Demo Application

This Node.js application demonstrates the concept of security logging in a web application. It includes user authentication, customer information management, and a view for security logs.

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/security-logging-demo.git
   cd security-logging-demo
   ```

2. Install dependencies:
   ```
   npm install
   ```

## Running the Application

### Without Docker

1. Start the application:
   ```
   npm start
   ```

2. Access the application at `http://localhost:8880`

### With Docker

1. Build the Docker image:
   ```
   docker build -t security-logging-demo .
   ```

2. Run the Docker container:
   ```
   docker run -p 8880:8880 security-logging-demo
   ```

3. Access the application at `http://localhost:8880`

## Interacting with the Application

1. Visit the home page at `http://localhost:8880`
2. Click on "Sign Up" to create a new account
3. Log in with your credentials
4. On the dashboard, you can create customer information
5. Click on "View Logs" to see the security logs

## Security Logging Implementation

The main security logging functionality is implemented in the `app.js` file. Here are the key components:

1. Security Logging Function:
   ```javascript
   function logSecurity(event) {
     const logEntry = JSON.stringify({
       timestamp: new Date().toISOString(),
       event: event
     }) + '\n';
     fs.appendFile(path.join(__dirname, '../logs/security.log'), logEntry, (err) => {
       if (err) console.error('Error writing to security log:', err);
     });
   }
   ```
   This function creates a JSON object with a timestamp and event description, then appends it to the `security.log` file.

2. Signup Route:
   ```javascript
   app.post('/signup', (req, res) => {
     const { email, password, name } = req.body;
     if (!email || !password || !name) {
       logSecurity(`Signup validation failure: Missing required fields`);
       return res.status(400).send('All fields are required');
     }
     if (users.find(u => u.email === email)) {
       logSecurity(`Signup failure: Email ${email} already exists`);
       return res.status(400).send('Email already exists');
     }
     // ... (user creation code)
     logSecurity(`User signed up: ${email}`);
     res.redirect('/login');
   });
   ```
   This route logs security events for signup validation failures and successful signups.

3. Login Route:
   ```javascript
   app.post('/login', (req, res) => {
     const { email, password } = req.body;
     const user = users.find(u => u.email === email);
     if (!user || !bcrypt.compareSync(password, user.password)) {
       logSecurity(`Login failure: Invalid credentials for ${email}`);
       return res.status(401).send('Invalid credentials');
     }
     // ... (login success code)
     logSecurity(`User logged in: ${email}`);
     res.redirect('/dashboard');
   });
   ```
   This route logs security events for login failures and successful logins.

4. Customer Creation:
   ```javascript
   app.post('/customer', (req, res) => {
     if (!req.session.user) {
       return res.status(401).send('Unauthorized');
     }
     const { name, email } = req.body;
     if (!name || !email) {
       logSecurity(`Customer creation failed: Missing required fields`);
       return res.status(400).send('Name and email are required');
     }
     // ... (customer creation code)
     logSecurity(`Customer created: ${JSON.stringify(newCustomer)}`);
     res.redirect('/dashboard');
   });
   ```
   This route logs security events for unauthorized access attempts and customer creation events.

## Triggering Negative Tests

To generate security logs for negative scenarios, you can:

1. Signup Validation Failure:
   - Attempt to sign up without providing all required fields

2. Duplicate Email Signup:
   - Try to sign up with an email that already exists in the system

3. Login Failure:
   - Attempt to log in with incorrect credentials

4. Unauthorized Access:
   - Try to access the dashboard or create a customer without logging in (e.g., by directly visiting `http://localhost:8880/dashboard`)

5. Customer Creation Failure:
   - While logged in, attempt to create a customer without providing all required fields

After performing these actions, you can view the generated security logs by logging in and clicking on the "View Logs" link in the dashboard.

## Security Considerations

This application is a demonstration and should not be used in a production environment without significant security enhancements, including:

- Using a secure database instead of in-memory storage
- Implementing proper session management and CSRF protection
- Securing the logging mechanism to prevent log injection and unauthorized access
- Implementing rate limiting and other anti-brute-force measures
- Using HTTPS for all communications

## License

This project is open-source and available under the MIT License.