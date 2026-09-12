require('dotenv').config();
const mongoose = require('mongoose');

let mongoServer = null;

/**
 * Connect to test database:
 * 1. Uses Atlas test database (`hospital_appointment_test`) if MONGO_URI is available.
 * 2. Or MongoMemoryServer if USE_MEMORY_DB is true or in environments without MONGO_URI.
 */
async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  // Tests must never fall back to a developer's production/development URI.
  const baseUri = process.env.MONGO_URI_TEST || (process.env.NODE_ENV === 'test' ? null : process.env.MONGO_URI);

  if (baseUri && process.env.USE_MEMORY_DB !== 'true') {
    const testUri = baseUri.includes('mongodb.net/?')
      ? baseUri.replace('mongodb.net/?', 'mongodb.net/hospital_appointment_test?')
      : baseUri;
    await mongoose.connect(testUri);
    return;
  }

  // Fallback to MongoMemoryServer
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  } catch (err) {
    if (baseUri) {
      const testUri = baseUri.includes('mongodb.net/?')
        ? baseUri.replace('mongodb.net/?', 'mongodb.net/hospital_appointment_test?')
        : baseUri;
      await mongoose.connect(testUri);
    } else {
      throw err;
    }
  }
}

/**
 * Clean all collections in test database
 */
async function clearDB() {
  if (mongoose.connection.readyState === 1) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  }
}

/**
 * Disconnect and stop memory server if running
 */
async function closeDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
}

module.exports = {
  connectDB,
  clearDB,
  closeDB,
};
