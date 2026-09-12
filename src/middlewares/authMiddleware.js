// @deprecated Use './auth.middleware' instead.
const { protect, restrictTo } = require('./auth.middleware');

module.exports = { protect, authorize: restrictTo };
