
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const MODEL_NAME = 'gemini-3-flash-preview';

export class AAVniService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async sendMessage(
    message: string, 
    history: { role: 'user' | 'model'; parts: { text: string }[] }[],
    location?: { latitude: number; longitude: number }
  ) {
    const response: GenerateContentResponse = await this.ai.models.generateContent({
      model: MODEL_NAME,
      contents: [
        ...history,
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        systemInstruction: "You are AAVni, a helpful, friendly assistant who loves using emojis! 🤖✨\n\n1. NEWS REQUESTS: When asked for news or headlines, always use the googleSearch tool. Provide 5-7 clear, numbered headlines. Start your news response with '🗞️ **Latest Headlines:**'. Make sure the headlines are concise.\n\n2. CLICKABLE HEADLINES: If the user asks for more info on a specific headline you previously gave, provide a detailed but readable summary with emojis. 📝\n\n3. OTHER QUESTIONS: For general knowledge, advice, or non-news questions, respond naturally and conversationally. Use lists if appropriate for clarity, but do not use the '🗞️ Latest Headlines:' prefix. 🌈\n\nAlways use emojis to make the conversation lively and user-friendly! 😊",
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "I'm sorry, I couldn't process that. 😅";
    
    // Extract grounding chunks for citations
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const links = chunks
      .filter(chunk => chunk.web)
      .map(chunk => ({
        title: chunk.web?.title || 'Source',
        uri: chunk.web?.uri || '#'
      }));

    return { text, links };
  }
}

export const aavni = new AAVniService();
