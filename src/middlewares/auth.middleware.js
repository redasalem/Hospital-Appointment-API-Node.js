const jwt = require('jsonwebtoken');
const ApiError = require('../utils/apiError');

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
const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // If Authorization header is present, perform standard JWT verification
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-key');
      req.user = decoded;
      return next();
    }

    // Pass-through during standalone module development if no auth header is supplied
    // Allows Doctor CRUD testing until Karim implements user login/registration tokens
    if (process.env.NODE_ENV === 'development' || !process.env.JWT_SECRET) {
      req.user = { role: 'Admin', id: 'dev-admin-id' };
      return next();
    }

    return next(new ApiError('Not authorized, missing or invalid token', 401));
  } catch (error) {
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
