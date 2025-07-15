import OpenAI from "openai";
import { storage } from "../storage";
import type { LearningContext } from "@shared/schema";

/*
Follow these instructions when using this blueprint:
1. Note that the newest OpenAI model is "gpt-4o", not "gpt-4". gpt-4o was released after your knowledge cutoff. Always prefer using gpt-4o as it is the latest model. When copying code from this blueprint, ensure you also mention this information verbatim as a comment so that you don't revert it to "gpt-4": `// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user`
2. Use the response_format: { type: "json_object" } option
3. Request output in JSON format in the prompt
*/

// Create OpenAI instance with user's API key
function createOpenAIClient(apiKey: string) {
  return new OpenAI({ apiKey });
}

export interface OpenAIResponse {
  content: string;
  confidence: number;
}

export async function generateResponse(
  userMessage: string,
  conversationHistory: Array<{ role: string; content: string }> = [],
  apiKey?: string
): Promise<OpenAIResponse> {
  try {
    if (!apiKey) {
      throw new Error("API key is required");
    }

    const openai = createOpenAIClient(apiKey);
    
    // Get learning context to improve responses
    const learningContext = await storage.getLearningContext();
    
    // Build context-aware prompt
    const systemPrompt = await buildSystemPrompt(learningContext);
    const conversationContext = buildConversationContext(conversationHistory);
    
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        ...conversationContext,
        { role: "user", content: userMessage }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const content = response.choices[0].message.content || "I'm sorry, I couldn't generate a response.";
    
    return {
      content,
      confidence: 0.8 // Base confidence, will be adjusted based on learning
    };
  } catch (error) {
    console.error("OpenAI API Error:", error);
    if (error.message?.includes("API key") || error.message?.includes("401")) {
      throw new Error("Invalid API key. Please check your OpenAI API key and try again.");
    }
    throw new Error("Failed to generate response");
  }
}

async function buildSystemPrompt(learningContext?: LearningContext): Promise<string> {
  let basePrompt = `You are an AI Learning Assistant that adapts to user preferences and improves over time. 
  You should be helpful, informative, and adjust your communication style based on user feedback.
  
  Key principles:
  - Provide clear, well-structured responses
  - Learn from user feedback to improve future interactions
  - Adapt your tone and approach based on user preferences
  - Be concise but comprehensive
  - Ask clarifying questions when needed`;

  if (learningContext) {
    basePrompt += `\n\nLearning Context:
    - Average user rating: ${learningContext.averageRating}/5
    - Total interactions: ${learningContext.totalInteractions}
    - Positive patterns: ${learningContext.positivePatterns?.join(", ") || "None yet"}
    - Areas for improvement: ${learningContext.negativePatterns?.join(", ") || "None yet"}
    - User preferences: ${learningContext.preferredTopics?.join(", ") || "Learning..."}
    
    Please adjust your responses based on this learning context to better serve the user.`;
  }

  return basePrompt;
}

function buildConversationContext(history: Array<{ role: string; content: string }>) {
  return history.slice(-10).map(msg => ({
    role: msg.role === "user" ? "user" as const : "assistant" as const,
    content: msg.content
  }));
}

export async function processUserFeedback(
  messageId: number,
  rating: "positive" | "negative",
  messageContent: string,
  apiKey?: string
): Promise<void> {
  try {
    // Get or create learning context
    let learningContext = await storage.getLearningContext();
    
    if (!learningContext) {
      learningContext = await storage.createLearningContext({
        totalInteractions: 0,
        averageRating: 3.0,
        positivePatterns: [],
        negativePatterns: [],
        preferredTopics: [],
        lastUpdated: new Date()
      });
    }

    // Update learning context based on feedback
    await updateLearningContext(learningContext, rating === "positive", messageContent);
    
  } catch (error) {
    console.error("Error processing feedback:", error);
  }
}

async function updateLearningContext(
  context: LearningContext,
  isPositive: boolean,
  messageContent: string
): Promise<void> {
  const updates: Partial<LearningContext> = {
    totalInteractions: context.totalInteractions + 1,
    averageRating: calculateNewAverageRating(context, isPositive),
    lastUpdated: new Date()
  };

  if (isPositive) {
    const positivePatterns = analyzePositivePatterns(messageContent);
    updates.positivePatterns = [
      ...(context.positivePatterns || []),
      ...positivePatterns
    ].slice(-10); // Keep only last 10 patterns
  } else {
    const negativePatterns = analyzeNegativePatterns(messageContent);
    updates.negativePatterns = [
      ...(context.negativePatterns || []),
      ...negativePatterns
    ].slice(-10); // Keep only last 10 patterns
  }

  // Extract and update preferred topics
  const keywords = extractKeywords(messageContent);
  updates.preferredTopics = [
    ...(context.preferredTopics || []),
    ...keywords
  ].slice(-20); // Keep only last 20 topics

  await storage.updateLearningContext(updates);
}

function extractKeywords(content: string): string[] {
  const words = content.toLowerCase().split(/\s+/);
  const stopWords = new Set(['the', 'is', 'at', 'which', 'on', 'and', 'a', 'to', 'are', 'as', 'was', 'will', 'be']);
  return words
    .filter(word => word.length > 3 && !stopWords.has(word))
    .slice(0, 5);
}

function analyzePositivePatterns(content: string): string[] {
  const patterns = [];
  if (content.includes("example")) patterns.push("likes_examples");
  if (content.includes("step")) patterns.push("prefers_steps");
  if (content.includes("detail")) patterns.push("wants_details");
  if (content.includes("simple")) patterns.push("prefers_simple");
  return patterns;
}

function analyzeNegativePatterns(content: string): string[] {
  const patterns = [];
  if (content.includes("confusing")) patterns.push("finds_confusing");
  if (content.includes("too long")) patterns.push("prefers_shorter");
  if (content.includes("unclear")) patterns.push("needs_clarity");
  return patterns;
}

function calculateNewAverageRating(context: LearningContext, isPositive: boolean): number {
  const currentRating = context.averageRating;
  const totalInteractions = context.totalInteractions;
  const newRating = isPositive ? 5 : 1;
  
  return ((currentRating * totalInteractions) + newRating) / (totalInteractions + 1);
}