const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();

// Enable CORS for all routes
app.use(cors()); // Allow all domains (use this during development)

// Middleware for parsing JSON bodies
app.use(bodyParser.json());

// Routes
const authRouter = require('./routes/auth');
const studentRouter = require('./routes/students');
const dashboardRouter = require('./routes/dashboard');

app.use('/api/auth', authRouter);  // Login route
app.use('/api/students', studentRouter); // Student management routes
app.use('/api/dashboard', dashboardRouter); // Admin dashboard route

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/school', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// Start the server
app.listen(3000, () => {
  console.log('Server started on port 3000');
});
