const jwt = require('jsonwebtoken');
const ApiError = require('../utils/apiError');
const User = require('../models/User');
const RevokedToken = require('../models/revokedToken.model');

/**
 * Authentication & Authorization Middleware Stubs / Hooks
 * Assigned to: Karim Khaled Ismail (HAA-3)
 * 
 * These middlewares provide the integration points for role-based access control (RBAC).
 * They allow current development testing while seamlessly enabling JWT validation once HAA-3 is finalized.
 */

/**
 * Protect routes - Verifies JWT bearer token
 */
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) throw new ApiError('Not authorized, missing token', 401);
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.jti || await RevokedToken.exists({ jti: decoded.jti })) throw new ApiError('Not authorized, token has been revoked', 401);
    const user = await User.findById(decoded.id).select('-password').lean();
    if (!user) throw new ApiError('Not authorized, user no longer exists', 401);
    req.user = { id: user._id.toString(), role: user.role, token, tokenPayload: decoded };
    return next();
  } catch (error) {
    if (error instanceof ApiError) return next(error);
    return next(new ApiError('Invalid or expired token', 401));
  }
};

/**
 * Restrict access to specific roles (e.g. Admin, Doctor, Patient)
 * @param  {...string} roles
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new ApiError('Forbidden: You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};

module.exports = {
  protect,
  restrictTo,
};
