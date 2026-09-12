require('dotenv').config();

const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log('========================================');
      console.log(`  Hospital Appointment API - Team 5`);
      console.log('========================================');
      console.log(`  Environment : ${process.env.NODE_ENV || 'development'}`);
      console.log(`  Server      : http://localhost:${PORT}`);
      console.log(`  Swagger     : http://localhost:${PORT}/api-docs`);
      console.log(`  Health      : http://localhost:${PORT}/health`);
      console.log('========================================');
    });
  })
  .catch((err) => {
    console.error('========================================');
    console.error('  Failed to start server');
    console.error(`  Error: ${err.message}`);
    console.error('========================================');
    process.exit(1);
  });
