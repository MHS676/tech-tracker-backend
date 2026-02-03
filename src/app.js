const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');

const app = express();

app.use(cors());
app.use(express.json());

// Basic health check
app.get('/health', (req, res) => res.send('System Live 🚀'));

// API Routes
app.use('/api', apiRoutes);

module.exports = app;