import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface AiSuggestion {
  text: string;
  feedback: string;
}

export const generateMitigationAdvice = async (riskTitle: string, riskDescription: string): Promise<AiSuggestion> => {
  try {
    const model = 'gemini-2.5-flash';
    const prompt = `
      Act as a Senior Risk Manager.
      Risk Title: "${riskTitle}"
      Risk Description: "${riskDescription}"
      
      Task:
      1. Provide 3 concise, bullet-pointed mitigation actions suitable for an enterprise risk register action plan.
      2. Provide a brief rationale explaining why these specific actions are appropriate for this risk.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            mitigation_actions: { 
              type: Type.STRING, 
              description: "The 3 bullet points of mitigation advice." 
            },
            rationale: { 
              type: Type.STRING, 
              description: "A brief explanation of why these controls were selected and how they address the root cause." 
            }
          },
          required: ["mitigation_actions", "rationale"]
        }
      }
    });

    const json = JSON.parse(response.text || '{}');
    return {
      text: json.mitigation_actions || "No suggestions available.",
      feedback: json.rationale || "No rationale provided."
    };
  } catch (error) {
    console.error("Gemini Error:", error);
    return { 
      text: "Unable to generate suggestions at this time.", 
      feedback: "An error occurred while contacting the AI service." 
    };
  }
};

export const improveRiskDescription = async (currentDescription: string, riskTitle: string): Promise<AiSuggestion> => {
  try {
    const model = 'gemini-2.5-flash';
    const prompt = `
      You are a Risk Management Assistant. Your task is to rewrite a risk description to strictly follow the standard formula and provide constructive feedback.

      Standard Formula:
      "There is a risk that [event], caused by [cause], which may result in [impact]."

      Definitions:
      1. Cause – what could trigger the risk.
      2. Event – what the risk is (the uncertainty).
      3. Impact – what happens if it materializes.

      Input Data:
      Risk Title: "${riskTitle}"
      Current Draft: "${currentDescription}"

      Instructions:
      1. Analyze the Input Data.
      2. Rewrite the description using EXACTLY the formula: "There is a risk that [event], caused by [cause], which may result in [impact]."
      3. Provide feedback on the original draft. Explicitly state what was missing (e.g., "The original draft lacked a clear cause") or what was improved (e.g., "Clarified the impact statement").
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            rewritten_description: { 
              type: Type.STRING, 
              description: "The standardized risk description strictly following the formula." 
            },
            feedback: { 
              type: Type.STRING, 
              description: "Constructive feedback on the original draft and explanation of improvements." 
            }
          },
          required: ["rewritten_description", "feedback"]
        }
      }
    });

    const json = JSON.parse(response.text || '{}');
    return {
      text: json.rewritten_description || currentDescription,
      feedback: json.feedback || "No feedback provided."
    };
  } catch (error) {
    console.error("Gemini Error:", error);
    return { 
      text: currentDescription, 
      feedback: "Unable to analyze the description at this time." 
    };
  }
};