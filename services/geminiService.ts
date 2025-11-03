import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { TUTOR_SYSTEM_PROMPT } from '../constants';
import { ChatMessage } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to convert base64 data URL to a Gemini Part
const fileToGenerativePart = (dataUrl: string) => {
  const match = dataUrl.match(/^data:(image\/(?:jpeg|png|webp));base64,(.*)$/);
  if (!match) {
    throw new Error("Invalid data URL format");
  }
  const mimeType = match[1];
  const data = match[2];
  return {
    inlineData: {
      data,
      mimeType,
    },
  };
};

export const getTutorResponse = async (
  history: ChatMessage[],
  latestMessage: ChatMessage,
  isThinkingMode: boolean
): Promise<string> => {
  const modelName = isThinkingMode ? 'gemini-2.5-pro' : 'gemini-2.5-flash';
  const config = isThinkingMode ? { thinkingConfig: { thinkingBudget: 32768 } } : {};

  const systemInstruction = isThinkingMode ? TUTOR_SYSTEM_PROMPT : "You are a helpful assistant. Respond in French.";

  const contents = history.map(msg => {
    // FIX: Explicitly type `parts` to allow for both text and image content.
    // TypeScript was inferring the type as `({ text: string })[]`, which caused a type error
    // when attempting to add an image part with a different structure.
    const parts: ({ text: string } | { inlineData: { data: string; mimeType: string; } })[] = [{ text: msg.text }];
    if (msg.image) {
      try {
        parts.unshift(fileToGenerativePart(msg.image));
      } catch (error) {
        console.error("Error processing image for history:", error);
      }
    }
    return {
      role: msg.sender === 'ai' ? 'model' : 'user',
      parts,
    };
  });

  // Add the latest message to the contents to be sent
  // FIX: Explicitly type `latestUserParts` to allow for both text and image content.
  // TypeScript was inferring the type as `({ text: string })[]`, which caused a type error
  // when attempting to add an image part with a different structure.
  const latestUserParts: ({ text: string } | { inlineData: { data: string; mimeType: string; } })[] = [{ text: latestMessage.text }];
  if (latestMessage.image) {
    try {
      latestUserParts.unshift(fileToGenerativePart(latestMessage.image));
    } catch(error) {
        console.error("Error processing latest image:", error);
        return "Désolé, j'ai eu un problème pour analyser votre image. Veuillez réessayer avec une autre image.";
    }
  }
   
  const fullContents = [...contents, { role: 'user', parts: latestUserParts }];


  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: modelName,
      contents: fullContents,
      config: {
        ...config,
        systemInstruction: systemInstruction
      },
    });

    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "Désolé, une erreur est survenue. Veuillez réessayer plus tard.";
  }
};
