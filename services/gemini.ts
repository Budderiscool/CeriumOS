import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

let ai: GoogleGenAI | null = null;

export const generateResponse = async (
  prompt: string,
  history: { role: 'user' | 'model'; content: string }[] = []
): Promise<string> => {
  try {
    // Lazy initialization to prevent app crash on load if key is missing/invalid
    if (!ai) {
        // Safe access to process.env.API_KEY. 
        // Note: The process polyfill in index.html ensures this line doesn't throw ReferenceError.
        const apiKey = process.env.API_KEY;
        
        if (!apiKey) {
            return "Configuration Error: API_KEY is missing from environment variables. Please add 'API_KEY' to your Vercel project settings and ensure it is exposed to the client.";
        }
        ai = new GoogleGenAI({ apiKey });
    }

    const model = 'gemini-2.5-flash';
    
    // Construct chat history for context
    const chat = ai.chats.create({
      model: model,
      history: history.map(h => ({
        role: h.role,
        parts: [{ text: h.content }]
      })),
      config: {
        systemInstruction: "You are Cerium AI, a helpful, concise, and intelligent assistant integrated into the Cerium Operating System. You help users with tasks, answer questions, and provide information.",
      }
    });

    const result: GenerateContentResponse = await chat.sendMessage({ message: prompt });
    return result.text || "I'm sorry, I couldn't generate a response.";
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return `AI Service Error: ${error.message || 'Connection failed'}. Please check your API Key and network.`;
  }
};