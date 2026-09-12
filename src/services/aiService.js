const generateSymptomSummary = async (symptoms, description) => {
  const model = (process.env.GEMINI_MODEL || 'gemini-3.6-flash').trim();
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('Gemini AI is not configured');

  const prompt = `You are an AI assistant for a hospital appointment system. 
Summarize the following patient symptoms into a concise, structured bullet-point summary for a doctor.
IMPORTANT: DO NOT provide any medical diagnosis or treatment advice.

Symptoms: ${symptoms}
Additional Info: ${description || 'None'}`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
      signal: AbortSignal.timeout(15000),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
};

module.exports = { generateSymptomSummary };
