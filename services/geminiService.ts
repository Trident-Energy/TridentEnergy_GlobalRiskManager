
import { GoogleGenAI, Content, Part } from "@google/genai";
import { ContractData } from "../types";

// Fix for TypeScript error TS2580
declare var process: {
  env: {
    API_KEY: string;
  }
};

const getApiKey = () => process.env.API_KEY || '';

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export const analyzeContractRisks = async (contract: ContractData): Promise<string> => {
  const apiKey = getApiKey();

  if (!apiKey) {
    return "API Key not configured. Unable to perform AI analysis.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: apiKey });
    
    const prompt = `
      You are a legal and risk expert for an oil and gas company. 
      Analyze the following contract summary and provide a concise 3-bullet point executive risk assessment for the CEO.
      Focus on financial exposure, operational criticality, and potential gaps in mitigation.

      Contract Title: ${contract.contractorName}
      Scope: ${contract.scopeOfWork}
      Amount: $${contract.amount}
      Duration: ${contract.startDate} to ${contract.endDate}
      Liability Cap: ${contract.liabilityCapPercent}%
      
      Evaluation Context:
      - Technical: ${contract.technicalEvalSummary}
      - Commercial: ${contract.commercialEvalSummary}
      - Tender Process: ${contract.tenderProcessSummary}

      Risk Profile:
      - Deviations: ${contract.deviationsDescription || 'None'}
      - Subcontracting: ${contract.subcontractingPercent}%
      - Identified Risks: ${contract.riskDescription}
      - Mitigations: ${contract.mitigationMeasures}
      
      Output format:
      - [Risk Level: Low/Medium/High]: Summary sentence...
      - Key Concern 1...
      - Key Concern 2...
      - (Optional) Mitigation Gaps...
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "No analysis generated.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error generating AI analysis. Please review manually.";
  }
};

export const refineContractText = async (text: string, context: 'scope' | 'background'): Promise<string> => {
  const apiKey = getApiKey();
  if (!apiKey || !text || text.length < 5) return text;

  try {
    const ai = new GoogleGenAI({ apiKey: apiKey });
    
    const prompt = `
      You are a senior contract administrator in the Oil & Gas industry.
      Rewrite the following rough text to be professional, precise, and legally sound.
      
      Context: ${context === 'scope' ? 'Scope of Work Description' : 'Executive Business Case/Background'}
      Input Text: "${text}"
      
      Rules:
      - Improve clarity and professional tone.
      - Fix grammar.
      - Keep it concise but detailed enough for a legal contract.
      - Do not add made-up details, just refine what is there.
      - Return ONLY the rewritten text, no conversational filler.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || text;
  } catch (error) {
    console.error("Gemini Refine Error:", error);
    return text; // Fallback to original
  }
};

export const sendContractQuery = async (
  contract: ContractData, 
  history: ChatMessage[], 
  message: string
): Promise<string> => {
  const apiKey = getApiKey();
  if (!apiKey) return "API Key not configured.";

  try {
    const ai = new GoogleGenAI({ apiKey: apiKey });
    
    // Construct System Instruction based on contract metadata
    const systemInstruction = `
      You are an intelligent Contract Assistant for Trident Energy.
      You are helpful, precise, and professional.
      
      Your goal is to answer questions about the specific contract provided below.
      Do not invent facts. If the information is not in the contract summary or attached documents, state that it is not available.
      
      --- CONTRACT DATA ---
      Title: ${contract.title}
      Contractor: ${contract.contractorName}
      Entity: ${contract.entity}
      Department: ${contract.department}
      Type: ${contract.contractorName} (${contract.contractType})
      Value: ${contract.originalAmount} ${contract.originalCurrency} (USD Eqv: ${contract.amount})
      Dates: ${contract.startDate} to ${contract.endDate}
      
      Scope of Work: ${contract.scopeOfWork}
      Background/Need: ${contract.backgroundNeed}
      
      Commercial Terms:
      - Pricing: ${contract.priceStructure}
      - Liability Cap: ${contract.liabilityCapPercent}%
      - Subcontracting: ${contract.isSubcontracting ? 'Allowed (' + contract.subcontractingPercent + '%)' : 'Not Allowed'}
      
      Evaluations:
      - Technical: ${contract.technicalEvalSummary}
      - Commercial: ${contract.commercialEvalSummary}
      
      Risks:
      - Identified: ${contract.riskDescription}
      - Mitigation: ${contract.mitigationMeasures}
      - Deviations: ${contract.deviationsDescription}
      
      Vendor Info:
      - DDQ: ${contract.ddqNumber} (Valid until ${contract.ddqValidityDate})
      ---------------------
    `;

    // 1. Prepare Document Parts from Base64 data
    const documentParts: Part[] = [];
    if (contract.documents) {
        contract.documents.forEach(doc => {
            if (doc.base64) {
                // Determine mimeType (default to pdf if unknown)
                const mimeType = doc.type || 'application/pdf';
                // Clean base64 string: remove data URL prefix if present
                const base64Data = doc.base64.includes(',') ? doc.base64.split(',')[1] : doc.base64;
                
                documentParts.push({
                    inlineData: {
                        mimeType: mimeType,
                        data: base64Data
                    }
                });
            }
        });
    }

    // 2. Create the initial history context
    // We inject a fake "User" message at the start containing the documents.
    // This allows Gemini to "see" the files in the context window.
    const initialContextMessage: Content = {
        role: 'user',
        parts: [
            { text: "Here are the uploaded contract documents for reference. Please use them to answer my questions." },
            ...documentParts
        ]
    };

    const modelAck: Content = {
        role: 'model',
        parts: [{ text: "Understood. I have reviewed the contract documents and am ready to answer your questions." }]
    };

    // 3. Convert user's chat history to Gemini Content format
    const userHistory: Content[] = history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }]
    }));

    // Combine: [Docs Context] -> [Model Ack] -> [Previous Chat]
    // Note: If no documents, we skip the initial context to save tokens/complexity
    const finalHistory: Content[] = documentParts.length > 0 
        ? [initialContextMessage, modelAck, ...userHistory] 
        : userHistory;

    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: systemInstruction,
      },
      history: finalHistory
    });

    const response = await chat.sendMessage({ message: message });
    return response.text || "I couldn't generate a response.";

  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "I'm having trouble connecting to the AI service or processing the documents right now. Please try again.";
  }
};
