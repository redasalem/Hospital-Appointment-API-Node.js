const { generateSymptomSummary } = require('../services/aiService');


const summarizeSymptoms = async (req, res) => {
    try {
        const { symptoms, description } = req.body; 
        
        if (!symptoms || symptoms.trim() === '') {
            return res.status(400).json({
                    message: 'Symptoms input is required.'});
        }
        if (symptoms.length > 2000) {
            return res.status(400).json({
                    message: 'Input is too long. Max 2000 characters allowed.'});
        }
        const summary = await generateSymptomSummary(symptoms,description);

        return res.status(200).json({success: true,summary: summary,});

    }catch(error) {
        return res.status(500).json({
                message: 'Error processing symptoms with Gemini AI.',
                error: error.message,
    });

    }
};

module.exports = { summarizeSymptoms };