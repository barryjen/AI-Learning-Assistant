import { GoogleGenAI } from "@google/genai";
import { storage } from "../storage";
import type { LearningContext } from "@shared/schema";

// Create AI instance with user's API key
function createGeminiClient(apiKey: string) {
  return new GoogleGenAI({ apiKey });
}

export interface GeminiResponse {
  content: string;
  confidence: number;
}

export async function generateResponse(
  userMessage: string,
  conversationHistory: Array<{ role: string; content: string }> = [],
  apiKey?: string
): Promise<GeminiResponse> {
  try {
    if (!apiKey) {
      throw new Error("API key is required");
    }

    const ai = createGeminiClient(apiKey);
    
    // Get learning context to improve responses
    const learningContext = await storage.getLearningContext();
    
    // Build context-aware prompt
    const systemPrompt = await buildSystemPrompt(learningContext);
    const conversationContext = buildConversationContext(conversationHistory);
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
      },
      contents: [
        ...conversationContext,
        { role: "user", parts: [{ text: userMessage }] }
      ],
    });

    const content = response.text || "I'm sorry, I couldn't generate a response.";
    
    return {
      content,
      confidence: 0.8 // Base confidence, will be adjusted based on learning
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    if (error.message?.includes("API_KEY_INVALID") || error.message?.includes("API key")) {
      throw new Error("Invalid API key. Please check your Gemini API key and try again.");
    }
    throw new Error("Failed to generate response");
  }
}

async function buildSystemPrompt(learningContext?: LearningContext): Promise<string> {
  let basePrompt = `You are an AI Learning Assistant that improves through user feedback. 
You should provide helpful, accurate, and clear responses. 
Always aim to be educational and supportive.`;

  if (learningContext) {
    if (learningContext.positivePatterns && learningContext.positivePatterns.length > 0) {
      basePrompt += `\n\nBased on positive feedback, users appreciate when you: ${learningContext.positivePatterns.join(", ")}`;
    }
    
    if (learningContext.negativePatterns && learningContext.negativePatterns.length > 0) {
      basePrompt += `\n\nBased on negative feedback, users prefer you avoid: ${learningContext.negativePatterns.join(", ")}`;
    }
    
    if (learningContext.averageRating && learningContext.averageRating > 0) {
      basePrompt += `\n\nYour current average rating is ${learningContext.averageRating}%. Continue to improve based on user feedback.`;
    }
  }

  return basePrompt;
}

function buildConversationContext(history: Array<{ role: string; content: string }>) {
  return history.slice(-10).map(msg => ({
    role: msg.role === "user" ? "user" as const : "model" as const,
    parts: [{ text: msg.content }]
  }));
}

export async function processUserFeedback(
  messageId: number,
  rating: "positive" | "negative",
  messageContent: string
): Promise<void> {
  try {
    // Store feedback
    await storage.createFeedback({
      messageId,
      rating
    });

    // Update learning context
    await updateLearningContext(rating, messageContent);
  } catch (error) {
    console.error("Error processing feedback:", error);
    throw error;
  }
}

async function updateLearningContext(
  rating: "positive" | "negative", 
  messageContent: string
): Promise<void> {
  let context = await storage.getLearningContext();
  
  if (!context) {
    // Create initial learning context
    context = await storage.createLearningContext({
      topicKeywords: [],
      positivePatterns: [],
      negativePatterns: [],
      averageRating: 0,
      totalFeedback: 0
    });
  }

  // Extract keywords from message content
  const keywords = extractKeywords(messageContent);
  
  // Update patterns based on feedback
  const currentPositivePatterns = context.positivePatterns || [];
  const currentNegativePatterns = context.negativePatterns || [];
  const currentTopicKeywords = context.topicKeywords || [];

  if (rating === "positive") {
    // Add patterns that worked well
    const newPatterns = analyzePositivePatterns(messageContent);
    const updatedPositivePatterns = [...new Set([...currentPositivePatterns, ...newPatterns])];
    
    await storage.updateLearningContext({
      topicKeywords: [...new Set([...currentTopicKeywords, ...keywords])],
      positivePatterns: updatedPositivePatterns.slice(-20), // Keep last 20
      totalFeedback: context.totalFeedback + 1,
      averageRating: calculateNewAverageRating(context, true)
    });
  } else {
    // Add patterns to avoid
    const newPatterns = analyzeNegativePatterns(messageContent);
    const updatedNegativePatterns = [...new Set([...currentNegativePatterns, ...newPatterns])];
    
    await storage.updateLearningContext({
      topicKeywords: [...new Set([...currentTopicKeywords, ...keywords])],
      negativePatterns: updatedNegativePatterns.slice(-20), // Keep last 20
      totalFeedback: context.totalFeedback + 1,
      averageRating: calculateNewAverageRating(context, false)
    });
  }
}

function extractKeywords(content: string): string[] {
  // Simple keyword extraction - in production, use more sophisticated NLP
  const words = content.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3);
  
  return [...new Set(words)].slice(0, 10);
}

function analyzePositivePatterns(content: string): string[] {
  const patterns = [];
  
  if (content.includes("explain") || content.includes("how")) {
    patterns.push("provide clear explanations");
  }
  if (content.includes("example") || content.includes("for instance")) {
    patterns.push("include relevant examples");
  }
  if (content.includes("step") || content.includes("process")) {
    patterns.push("break down into steps");
  }
  if (content.length > 200) {
    patterns.push("provide detailed responses");
  }
  
  return patterns;
}

function analyzeNegativePatterns(content: string): string[] {
  const patterns = [];
  
  if (content.length < 50) {
    patterns.push("avoid overly brief responses");
  }
  if (content.includes("I don't know") || content.includes("I'm not sure")) {
    patterns.push("avoid uncertain language");
  }
  if (content.includes("maybe") || content.includes("perhaps") || content.includes("possibly")) {
    patterns.push("be more definitive when possible");
  }
  
  return patterns;
}

function calculateNewAverageRating(context: LearningContext, isPositive: boolean): number {
  const currentTotal = context.totalFeedback * (context.averageRating || 0);
  const newTotal = currentTotal + (isPositive ? 100 : 0);
  return Math.round(newTotal / (context.totalFeedback + 1));
}
