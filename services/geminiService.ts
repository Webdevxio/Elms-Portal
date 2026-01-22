
import { GoogleGenAI, Type } from "@google/genai";
import { Quiz } from "../types";

// Lazy initialization to prevent top-level crashes if API_KEY is missing/invalid during load
let genAI: GoogleGenAI | null = null;

const getAI = () => {
  if (!genAI) {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.warn("Gemini API Key is missing. Please set it in your environment variables.");
    }
    genAI = new GoogleGenAI({ apiKey: apiKey || "" });
  }
  return genAI;
};

/**
 * Generates a summary of lesson content using the Gemini 3 Flash model
 */
export const generateLessonSummary = async (content: string): Promise<string> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Summarize the following educational content in 3 bullet points, highlighting key takeaways for a student:\n\n${content}`,
      config: {
        systemInstruction: "You are an expert educational tutor. Be concise, clear, and encouraging."
      }
    });
    return response.text || "Failed to generate summary.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error connecting to AI tutor. Please ensure the API Key is valid.";
  }
};

/**
 * Generates a structured multiple-choice quiz from educational content
 */
export const generateQuizFromContent = async (content: string): Promise<Quiz> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a 3-question multiple choice quiz based on this content: \n\n${content}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: { 
                    type: Type.ARRAY, 
                    items: { type: Type.STRING },
                    minItems: 4,
                    maxItems: 4
                  },
                  correctAnswer: { type: Type.INTEGER, description: "Index of correct option (0-3)" },
                  explanation: { type: Type.STRING }
                },
                required: ["question", "options", "correctAnswer", "explanation"]
              }
            }
          },
          required: ["title", "questions"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (e) {
    console.error("Quiz Gen Error:", e);
    throw new Error("Invalid response from AI");
  }
};

/**
 * Answers a student question in the context of specific lesson material
 */
export const askTutor = async (question: string, context: string): Promise<string> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Based on this lesson content: "${context}", answer this student's question: "${question}"`,
      config: {
        systemInstruction: "You are Lumina AI, a helpful teaching assistant. If the answer isn't in the content, use your general knowledge but mention it's outside the lesson scope."
      }
    });
    return response.text || "I'm having trouble thinking right now.";
  } catch (error) {
    console.error("Tutor Error:", error);
    return "I couldn't reach the tutor right now.";
  }
};
