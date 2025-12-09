import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = "You are an expert Enterprise Risk Manager (RMIA). Provide concise, professional, and actionable advice following ISO 31000 standards. Return responses in pure JSON format.";

interface AiResponse {
  text: string;
  feedback: string;
}

export const generateMitigationAdvice = async (title: string, description: string): Promise<AiResponse | null> => {
  try {
    const prompt = `
      Risk Context:
      Title: ${title}
      Description: ${description}

      Task: Suggest ONE robust mitigation control (action or mechanism) to reduce this risk.
      
      Output JSON Schema:
      {
        "text": "The mitigation control description (max 2 sentences)",
        "feedback": "Why this control is effective"
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json'
      }
    });

    const text = response.text;
    if (!text) return null;
    
    return JSON.parse(text);
  } catch (error) {
    console.error("AI Service Error:", error);
    return {
      text: "Unable to generate advice at this time.",
      feedback: "AI service unavailable."
    };
  }
};

export const improveRiskDescription = async (currentDescription: string, title: string): Promise<AiResponse | null> => {
  try {
    const prompt = `
      Risk Context:
      Title: ${title}
      Draft Description: ${currentDescription}

      Task: Rewrite the description to be precise and follow the structure: "There is a risk that [Event], caused by [Cause], which may result in [Impact]."

      Output JSON Schema:
      {
        "text": "The rewritten description",
        "feedback": "Brief explanation of improvements made"
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json'
      }
    });

    const text = response.text;
    if (!text) return null;

    return JSON.parse(text);
  } catch (error) {
    console.error("AI Service Error:", error);
    return {
      text: currentDescription,
      feedback: "AI service unavailable."
    };
  }
};