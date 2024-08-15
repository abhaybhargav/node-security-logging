const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 8880;

// In-memory data store
const users = [];
const customers = [];

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true
}));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

// Security logging function
function logSecurity(event) {
  const logEntry = JSON.stringify({
    timestamp: new Date().toISOString(),
    event: event
  }) + '\n';
  fs.appendFile(path.join(__dirname, '../logs/security.log'), logEntry, (err) => {
    if (err) console.error('Error writing to security log:', err);
  });
}

// Routes
app.get('/', (req, res) => {
  res.render('index');
});

app.get('/signup', (req, res) => {
  res.render('signup');
});

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
  const hashedPassword = bcrypt.hashSync(password, 10);
  users.push({ email, password: hashedPassword, name });
  logSecurity(`User signed up: ${email}`);
  res.redirect('/login');
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    logSecurity(`Login failure: Invalid credentials for ${email}`);
    return res.status(401).send('Invalid credentials');
  }
  req.session.user = { email: user.email, name: user.name };
  logSecurity(`User logged in: ${email}`);
  res.redirect('/dashboard');
});

app.get('/dashboard', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  res.render('dashboard', { user: req.session.user, customers: customers });
});

app.post('/customer', (req, res) => {
  if (!req.session.user) {
    return res.status(401).send('Unauthorized');
  }
  const { name, email } = req.body;
  if (!name || !email) {
    logSecurity(`Customer creation failed: Missing required fields`);
    return res.status(400).send('Name and email are required');
  }
  const newCustomer = { id: customers.length + 1, name, email };
  customers.push(newCustomer);
  logSecurity(`Customer created: ${JSON.stringify(newCustomer)}`);
  res.redirect('/dashboard');
});

app.get('/logs', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  fs.readFile(path.join(__dirname, '../logs/security.log'), 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading security log:', err);
      return res.status(500).send('Error reading security logs');
    }
    const logs = data.split('\n').filter(Boolean).map(JSON.parse);
    res.render('logs', { logs });
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});