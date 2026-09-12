const express = require('express');
const { registerUser, loginUser, getMe, logoutUser } = require('../controllers/authController');
const validate = require('../middlewares/validate.middleware');
const { protect } = require('../middlewares/auth.middleware');
const { registerSchema, loginSchema } = require('../validators/auth.validator');

const router = express.Router();

router.post('/register', validate(registerSchema), registerUser);
router.post('/login', validate(loginSchema), loginUser);
router.get('/me', protect, getMe);
router.post('/logout', protect, logoutUser);

module.exports = router;
