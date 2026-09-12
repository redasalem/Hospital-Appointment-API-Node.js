const { GoogleGenAI} = require("@google/genai");

const generateSymptomSummary = async (symptoms, description) =>{

    const ai = new GoogleGenAI({
        apiKey : process.env.GEMINI_API_KEY
    })

    const prompt = `You are an AI assistant for a hospital appointment system. 
    Summarize the following patient symptoms into a concise, structured bullet-point summary for a doctor.
    IMPORTANT: DO NOT provide any medical diagnosis or treatment advice.

    Symptoms: ${symptoms}
    Additional Info: ${description || 'None'}`;

    const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  return response.text;
};

module.exports = {
    generateSymptomSummary
};



