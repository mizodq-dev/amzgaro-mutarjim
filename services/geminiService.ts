import { GoogleGenAI, SchemaType, Type } from "@google/genai";
import { ProcessingOptions, SummaryType } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION_BASE = `
You are "Amzgaro Motarjjim", a world-class professional translator and linguist specialized in Modern Standard Arabic (MSA). 
Your goal is to produce output suitable for academic, literary, and professional use.

CORE RULES:
1. Translate into high-quality Modern Standard Arabic (Fusha).
2. Strictly preserve the original meaning, tone, and intent.
3. Respect sentence structure and logical flow.
4. Use professional terminology appropriate for the context (e.g., technical, medical, literary).
5. Avoid literal word-for-word translation; prioritize fluency and clarity in Arabic.
6. Ensure correct grammar and diacritics where necessary for ambiguity resolution.
`;

export const processContent = async (
  input: string,
  isUrl: boolean,
  options: ProcessingOptions
): Promise<{ translation?: string; summary?: string }> => {
  
  // Decide model based on complexity. Using 3-pro-preview for high reasoning capabilities.
  const modelName = 'gemini-3-pro-preview';

  const results: { translation?: string; summary?: string } = {};

  try {
    // 1. Translation Task
    if (options.translate) {
      let prompt = "";
      if (isUrl) {
         prompt = `I will provide a YouTube URL. Please analyze the content of the video (using your search tools or knowledge base) and translate the spoken content or transcript into professional Modern Standard Arabic. 
         
         URL: ${input}
         
         If you cannot access the specific video content directly, search for the transcript or a detailed summary of this specific video and translate that.
         Output ONLY the Arabic translation.`;
      } else {
        prompt = `Translate the following text into professional Modern Standard Arabic (MSA). Maintain the original formatting (paragraphs, lists).
        
        Text to translate:
        """
        ${input}
        """`;
      }

      // Use tool if URL
      const tools = isUrl ? [{ googleSearch: {} }] : undefined;

      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION_BASE,
          tools: tools,
          // Use thinking for better quality translation if not using tools (thinking not always compat with tools in all previews, keeping safe)
          // We will rely on the Pro model's inherent strength.
        }
      });
      
      results.translation = response.text || "Could not generate translation.";
    }

    // 2. Summarization Task
    if (options.summarize) {
      let prompt = "";
      const summaryAdjective = options.summaryType === SummaryType.DETAILED ? "detailed, structured" : "concise, brief";
      
      if (isUrl) {
         prompt = `Analyze the YouTube video at this URL: ${input}. Provide a ${summaryAdjective} summary of the content in professional Modern Standard Arabic.`;
      } else {
        prompt = `Provide a ${summaryAdjective} summary of the following text in professional Modern Standard Arabic.
        
        Text to summarize:
        """
        ${input}
        """`;
      }

      const tools = isUrl ? [{ googleSearch: {} }] : undefined;

      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION_BASE,
          tools: tools,
        }
      });

      results.summary = response.text || "Could not generate summary.";
    }

    return results;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to process content. Please check the input or API key.");
  }
};