require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');

const connectDB = require('./config/db');
const { validateEnv } = require('./config/env');
const errorHandler = require('./middleware/errorHandler');

// Validate environment variables
validateEnv();

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes (to be added)
// app.use('/api/v1/auth', require('./routes/auth.routes'));
// app.use('/api/v1/boards', require('./routes/board.routes'));
// app.use('/api/v1/lists', require('./routes/list.routes'));
// app.use('/api/v1/tasks', require('./routes/task.routes'));
// app.use('/api/v1/activities', require('./routes/activity.routes'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: 'Route not found',
      code: 'NOT_FOUND'
    }
  });
});

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 3008;

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

module.exports = { app, server };
