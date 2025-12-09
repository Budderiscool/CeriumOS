import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// Safely retrieve API key to prevent "process is not defined" crashes in browser environments
const getApiKey = () => {
  // Use the API key provided by the user
  return 'test';
};

const ai = new GoogleGenAI({ apiKey: getApiKey() });

export const generateResponse = async (
  prompt: string,
  history: { role: 'user' | 'model'; content: string }[] = []
): Promise<string> => {
  try {
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
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I encountered an error connecting to the AI service. Please check your network or API key.";
  }
};
