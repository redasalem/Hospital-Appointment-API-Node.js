const { generateSymptomSummary } = require('../services/aiService');


const summarizeSymptoms = async (req, res) => {
    try {
        const { symptoms, description } = req.body;
        const summary = await generateSymptomSummary(symptoms,description);

        return res.status(200).json({success: true,summary: summary,});

    } catch (error) {
        console.error('Gemini AI error:', error.message);
        return res.status(502).json({ success: false, message: 'Symptom summary service is unavailable.' });
    }
};

module.exports = { summarizeSymptoms };
