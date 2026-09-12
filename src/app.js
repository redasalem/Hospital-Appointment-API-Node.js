const express = require('express');
const cors = require('cors');
const setupSwagger = require('./config/swagger');
const errorHandler = require('./middlewares/errorHandler.middleware');

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

// Global Error-handling middleware
app.use(errorHandler);

module.exports = app;

