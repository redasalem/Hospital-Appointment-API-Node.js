const express = require('express');
const router = express.Router();
const { summarizeSymptoms } = require('../controllers/aiController');

router.post('/summarize-symptoms', summarizeSymptoms);

module.exports = router;