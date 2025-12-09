import { GoogleGenAI, Chat } from "@google/genai";
import { Subject } from "../types";

// Helper to convert File to Base64
const fileToGenerativePart = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// System prompts map
const getSystemPrompt = (subject: Subject): string => {
  return `You are an expert University Professor, specialized in ${subject}. 
  Your Goal: Analyze the uploaded image deeply and provide a comprehensive solution.
  
  Tone: Academic, precise, yet accessible to students.
  
  DOMAIN INSTRUCTIONS:
  - **Calculus / Math**: 
     - Solve the problem step-by-step. 
     - **CRITICAL**: Show intermediate calculations.
     - Explicitly state theorems or rules applied (e.g., "Applying the Chain Rule", "Using Integration by Parts", "Fundamental Theorem of Calculus").
     - Use LaTeX for all math ($x^2$, $$ \int $$).
  
  - **Digital Logic Design (DLD)**: 
     - Identify gates/circuits.
     - Explicitly identify and explain symbols for **XOR, XNOR, NAND, NOR** and **Flip-Flops (D, T, JK)** if present.
     - Derive Boolean expressions and Truth Tables. 
  
  - **AI & Algorithms**: 
     - Explain the algorithm or logic first.
     - Describe data structures involved (arrays, trees, graphs) and their execution flow.
     - Provide Python code.

  - **Computer Science / Data Science**: Explain the algorithm or logic first, then provide the code.

  CRITICAL FORMATTING FOR UI TABS:
  If the solution involves Code (Python, Verilog, C++) or distinct Implementation details:
  You MUST separate the "Conceptual Explanation" from the "Code/Implementation" using EXACTLY this string:
  "|||SECTION_SPLIT|||"
  
  Response Structure:
  [Conceptual Analysis, Math, Logic, Truth Tables]
  |||SECTION_SPLIT|||
  [Source Code (Python/Verilog) or Implementation]
  `;
};

export class ChatService {
  private chat: Chat | null = null;
  private currentSubject: Subject = Subject.CALCULUS;

  // Helper to retrieve the client dynamically
  private getAIClient(): GoogleGenAI {
    // Check localStorage first for user-provided key, fallback to env variable
    const apiKey = localStorage.getItem('GEMINI_API_KEY') || process.env.API_KEY;
    
    if (!apiKey) {
      throw new Error("Missing API Key. Please enter your Gemini API Key in Settings.");
    }
    
    return new GoogleGenAI({ apiKey });
  }

  async startSession(subject: Subject) {
    this.currentSubject = subject;

    const config: any = {
      systemInstruction: getSystemPrompt(subject),
    };

    // Enable Google Search Grounding for Data Science to ensure up-to-date libraries/methods
    if (subject === Subject.DATA_SCIENCE) {
      config.tools = [{ googleSearch: {} }];
    }

    try {
      // Initialize client and chat
      const ai = this.getAIClient();
      
      // Using gemini-3-pro-preview for best reasoning capabilities
      this.chat = ai.chats.create({
        model: 'gemini-3-pro-preview',
        config: config
      });
    } catch (error: any) {
        console.error("Initialization Error:", error);
        throw error;
    }
  }

  // Helper to extract and format grounding sources from the response
  private appendGroundingSources(text: string, response: any): string {
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    
    if (groundingChunks && groundingChunks.length > 0) {
      const sources = groundingChunks
        .map((chunk: any) => chunk.web)
        .filter((web: any) => web && web.uri && web.title)
        .map((web: any) => `- [${web.title}](${web.uri})`);

      // Deduplicate sources
      const uniqueSources = [...new Set(sources)];

      if (uniqueSources.length > 0) {
        return text + `\n\n### Verified Sources\n${uniqueSources.join('\n')}`;
      }
    }
    return text;
  }

  private handleError(error: any): never {
      console.error("Gemini API Error:", error);
      let message = "An unexpected error occurred.";
      const errStr = (error.message || error.toString()).toLowerCase();
      
      if (errStr.includes("401") || errStr.includes("403") || errStr.includes("api key")) {
        message = "Access Denied. Please check your API Key in Settings.";
      } else if (errStr.includes("429")) {
        message = "Rate limit exceeded. Please wait a moment before trying again.";
      } else if (errStr.includes("503") || errStr.includes("overloaded")) {
        message = "System overloaded. The Professor is busy, please try again in a few seconds.";
      } else if (errStr.includes("fetch failed")) {
        message = "Network error. Please check your internet connection.";
      } else {
        message = error.message || "Unknown error occurred during analysis.";
      }
      
      throw new Error(message);
  }

  async analyzeImage(file: File): Promise<string> {
    // Ensure session is started.
    if (!this.chat) throw new Error("Session not initialized. Please refresh.");

    try {
      const base64Data = await fileToGenerativePart(file);
      
      const userPrompt = `Professor, please analyze this image regarding ${this.currentSubject}.
      
      If this is a Math problem, solve it step-by-step.
      If this is DLD, explain the logic and provide Verilog code if applicable.
      If this is Code/Data Science, explain the theory and then write the Python code.
      
      Remember to use the |||SECTION_SPLIT||| marker if you are generating code.`;

      const response = await this.chat.sendMessage({
        message: [
              { inlineData: { mimeType: file.type, data: base64Data } },
              { text: userPrompt }
          ]
      });

      const text = response.text || "I examined the image but could not generate a response.";
      return this.appendGroundingSources(text, response);

    } catch (error: any) {
      this.handleError(error);
    }
  }

  async sendMessage(text: string): Promise<string> {
    if (!this.chat) throw new Error("Chat session invalid.");
    
    try {
      const response = await this.chat.sendMessage({
        message: text
      });

      const responseText = response.text || "No response received.";
      return this.appendGroundingSources(responseText, response);

    } catch (error: any) {
      this.handleError(error);
    }
  }

  async generateImage(prompt: string): Promise<string> {
    const ai = this.getAIClient();
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    { text: "You are an expert technical illustrator. Create clean, clear, and accurate diagrams for STEM concepts. Do not add any artistic flair; focus on clarity and educational value. Create a diagram for: " + prompt }
                ]
            }
        });

        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                return `data:image/png;base64,${part.inlineData.data}`;
            }
        }
        
        throw new Error("No image data found in response");
    } catch (error: any) {
        this.handleError(error);
    }
  }
}