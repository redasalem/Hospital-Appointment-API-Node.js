require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../src/config/db');
const User = require('../src/models/User');

async function run() {
  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error('ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD are required');
  }
  await connectDB();
  let user = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });
  if (user) {
    user.name = ADMIN_NAME;
    user.role = 'admin';
    if (ADMIN_PASSWORD) user.password = ADMIN_PASSWORD;
    await user.save();
  } else {
    user = await User.create({ name: ADMIN_NAME, email: ADMIN_EMAIL.toLowerCase(), password: ADMIN_PASSWORD, role: 'admin' });
  }
  console.log(`Admin ready: ${user.email}`);
  await mongoose.disconnect();
}

run().catch(async (error) => { console.error(error.message); await mongoose.disconnect(); process.exitCode = 1; });
