const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const RevokedToken = require('../models/revokedToken.model');
const ApiError = require('../utils/apiError');

const generateToken = (user) => jwt.sign(
  { id: user._id, role: user.role, jti: crypto.randomUUID() },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
);
const userResponse = (user) => ({ _id: user._id, name: user.name, email: user.email, role: user.role });

async function registerUser(req, res, next) {
  try {
    const { name, email, password, role } = req.body;
    if (await User.exists({ email })) throw new ApiError('User already exists', 409);
    const user = await User.create({ name, email, password, role });
    return res.status(201).json({ success: true, data: userResponse(user), token: generateToken(user) });
  } catch (error) { return next(error); }
}

async function loginUser(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) throw new ApiError('Invalid email or password', 401);
    return res.json({ success: true, data: userResponse(user), token: generateToken(user) });
  } catch (error) { return next(error); }
}

async function getMe(req, res, next) {
  try {
    const user = await User.findById(req.user.id).select('-password').lean();
    return res.json({ success: true, data: userResponse(user) });
  } catch (error) { return next(error); }
}

async function logoutUser(req, res, next) {
  try {
    await RevokedToken.updateOne(
      { jti: req.user.tokenPayload.jti },
      { $set: { expiresAt: new Date(req.user.tokenPayload.exp * 1000) } },
      { upsert: true }
    );
    return res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) { return next(error); }
}

module.exports = { registerUser, loginUser, getMe, logoutUser };
