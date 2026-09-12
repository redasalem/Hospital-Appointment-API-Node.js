/**
 * Global Error-Handling Middleware
 * Catches and formats all errors into a consistent JSON response envelope.
 *
 * Handles:
 * - Mongoose ValidationError   → 400 with per-field details
 * - Mongoose CastError         → 400 "Invalid ID format"
 * - MongoDB duplicate key      → 409 Conflict
 * - Custom ApiError            → uses its own statusCode
 * - Everything else            → 500 Internal Server Error
 */
const errorHandler = (err, req, res, next) => {
  // ── Mongoose Validation Error ──────────────────────────────────────
  if (err.name === 'ValidationError' && err.errors) {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  // ── Mongoose CastError (e.g. invalid ObjectId) ────────────────────
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `Invalid ${err.path}: ${err.value}`,
    });
  }

  // ── MongoDB Duplicate Key Error ───────────────────────────────────
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue).join(', ');
    return res.status(409).json({
      success: false,
      message: `Duplicate value for field: ${field}. Please use another value.`,
    });
  }

  // ── Custom ApiError / Default ─────────────────────────────────────
  const statusCode = err.statusCode || err.status || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(err.errors && { errors: err.errors }),
  });
};

module.exports = errorHandler;
