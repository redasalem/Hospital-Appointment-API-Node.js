const express = require('express');
const router = express.Router();
const { summarizeSymptoms } = require('../controllers/aiController');
const validate = require('../middlewares/validate.middleware');
const { protect, restrictTo } = require('../middlewares/auth.middleware');
const { summarizeSymptomsSchema } = require('../validators/ai.validator');

router.post('/summarize-symptoms', protect, restrictTo('patient'), validate(summarizeSymptomsSchema), summarizeSymptoms);

module.exports = router;
