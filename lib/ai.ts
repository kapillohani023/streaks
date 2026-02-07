import "server-only";
import { GoogleGenerativeAI, Part } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
const SYSTEM_PROMPT = `You are a helpful and motivating Assistant.
Your goal is to help users maintain their habits, analyze their performance, and keep them motivated. 
Be concise, encouraging, and focus on action-oriented advice.
When analyzing performance, look for patterns and celebrate small wins.`;

class AIService {
  private model;

  constructor() {
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set");
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    this.model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: SYSTEM_PROMPT,
    });
  }

  async generateContent(prompt: string) {
    const result = await this.model.generateContent(prompt);
    return result.response.text();
  }

  async generateChat(
    history: { role: "user" | "model"; parts: string }[],
    message: string
  ) {
    const chat = this.model.startChat({
      history: history.map((h) => ({
        role: h.role,
        parts: [{ text: h.parts }] as Part[],
      })),
    });

    const result = await chat.sendMessage(message);
    return result.response.text();
  }

  async *generateChatStream(
    history: { role: "user" | "model"; parts: string }[],
    message: string
  ) {
    const chat = this.model.startChat({
      history: history.map((h) => ({
        role: h.role,
        parts: [{ text: h.parts }] as Part[],
      })),
    });

    const result = await chat.sendMessageStream(message);
    for await (const chunk of result.stream) {
      yield chunk.text();
    }
  }
}

let aiServiceInstance: AIService | null = null;

function getService() {
  if (!aiServiceInstance) {
    aiServiceInstance = new AIService();
  }
  return aiServiceInstance;
}

export async function generateAIResponse(prompt: string) {
  try {
    return await getService().generateContent(prompt);
  } catch (error) {
    console.error("AI Generation Error:", error);
    return "Sorry, I am having trouble connecting right now.";
  }
}

export async function chatCompletion(
  history: { role: "user" | "model"; content: string }[],
  message: string
) {
  try {
    const formattedHistory = history.map((msg) => ({
      role: msg.role,
      parts: msg.content,
    }));

    return await getService().generateChat(formattedHistory, message);
  } catch {
    return "Sorry, I am having trouble connecting right now.";
  }
}

export async function* chatCompletionStream(
  history: { role: "user" | "model"; content: string }[],
  message: string
) {
  const formattedHistory = history.map((msg) => ({
    role: msg.role,
    parts: msg.content,
  }));

  for await (const chunk of getService().generateChatStream(
    formattedHistory,
    message
  )) {
    if (chunk) {
      yield chunk;
    }
  }
}
