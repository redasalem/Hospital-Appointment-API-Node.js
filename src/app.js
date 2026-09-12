const express = require('express');
const cors = require('cors');
const setupSwagger = require('./config/swagger');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Swagger API Documentation
setupSwagger(app);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Routes
const doctorRoutes = require('./routes/doctor.routes');
app.use('/api/doctors', doctorRoutes);

// Error-handling middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(err.errors && { errors: err.errors }),
  });
});

module.exports = app;
