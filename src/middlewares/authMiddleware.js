const { protect, restrictTo } = require('./auth.middleware');

module.exports = { protect, authorize: restrictTo };
