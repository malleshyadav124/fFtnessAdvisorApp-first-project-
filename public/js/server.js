console.log('Starting the server...');

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config(); // To load environment variables like JWT_SECRET

// Initialize the Express app
const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// PostgreSQL connection setup
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'HealthDb',
  password: 'rootnode',
  port: 5432, // default PostgreSQL port
});

// Test route to confirm server is running
app.get('/', (req, res) => {
  res.send('Server is running!');
});

// ⬇️ Correct way: Import routes and pass `pool`
const authRoutes = require('./routes/auth')(pool);
const userRoutes = require('./routes/users')(pool);
const dietRoutes = require('./routes/diet')(pool);
const fitnessRoutes = require('./routes/fitness')(pool);
const progressRoutes = require('./routes/progress')(pool);
const tipsRoutes = require('./routes/tips')(pool);

// ⬇️ Use the routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/diet', dietRoutes);
app.use('/api/fitness', fitnessRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/tips', tipsRoutes);

// Start the server
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
