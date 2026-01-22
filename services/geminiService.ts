
import { GoogleGenAI, Type } from "@google/genai";
import { Quiz } from "../types";

// Always initialize GoogleGenAI with a named parameter using the process.env.API_KEY directly
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates a summary of lesson content using the Gemini 3 Flash model
 */
export const generateLessonSummary = async (content: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Summarize the following educational content in 3 bullet points, highlighting key takeaways for a student:\n\n${content}`,
      config: {
        systemInstruction: "You are an expert educational tutor. Be concise, clear, and encouraging."
      }
    });
    // Accessing the .text property directly as per the latest SDK requirements
    return response.text || "Failed to generate summary.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error connecting to AI tutor.";
  }
};

/**
 * Generates a structured multiple-choice quiz from educational content
 */
export const generateQuizFromContent = async (content: string): Promise<Quiz> => {
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

  try {
    // Ensuring the response text is handled as a property and parsed correctly as JSON
    return JSON.parse(response.text || "{}");
  } catch (e) {
    throw new Error("Invalid response from AI");
  }
};

/**
 * Answers a student question in the context of specific lesson material
 */
export const askTutor = async (question: string, context: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Based on this lesson content: "${context}", answer this student's question: "${question}"`,
    config: {
      systemInstruction: "You are Lumina AI, a helpful teaching assistant. If the answer isn't in the content, use your general knowledge but mention it's outside the lesson scope."
    }
  });
  // Using .text property directly
  return response.text || "I'm having trouble thinking right now.";
};
