const express = require('express');
const cors = require('cors');
const setupSwagger = require('./config/swagger');

const aiRoutes = require('./routes/aiRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/api/ai', aiRoutes);
// Swagger API Documentation
setupSwagger(app);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});


// Error-handling middleware
app.use((err, req, res, next) => {
  // TODO: Implement error handling logic
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
  });
});

module.exports = app;
