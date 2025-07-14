import { GoogleGenAI } from "@google/genai";
import { storage } from "../storage";
import type { LearningContext } from "@shared/schema";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface ModeResponse {
  content: string;
  suggestions: string[];
  confidence: number;
  mode: string;
}

export async function generateTutorResponse(
  userMessage: string,
  conversationHistory: Array<{ role: string; content: string }> = []
): Promise<ModeResponse> {
  const systemPrompt = `You are an expert tutor. Your role is to:
  - Break down complex topics into digestible steps
  - Use analogies and examples to explain concepts
  - Ask clarifying questions to ensure understanding
  - Provide practice exercises when appropriate
  - Encourage active learning and critical thinking
  
  Always structure your responses with:
  1. Clear explanations
  2. Step-by-step breakdowns
  3. Practical examples
  4. Questions to test understanding`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    config: { systemInstruction: systemPrompt },
    contents: [
      ...buildConversationContext(conversationHistory),
      { role: "user", parts: [{ text: userMessage }] }
    ],
  });

  const suggestions = [
    "Can you give me a practical example?",
    "What's the most important concept to remember?",
    "How can I practice this skill?",
    "What are common mistakes to avoid?"
  ];

  return {
    content: response.text || "I'd be happy to help you learn this topic step by step.",
    suggestions,
    confidence: 0.85,
    mode: "tutor"
  };
}

export async function generateCreativeResponse(
  userMessage: string,
  conversationHistory: Array<{ role: string; content: string }> = []
): Promise<ModeResponse> {
  const systemPrompt = `You are a creative assistant focused on:
  - Brainstorming and idea generation
  - Creative writing and storytelling
  - Artistic and design thinking
  - Innovative problem-solving approaches
  - Inspirational and imaginative responses
  
  Be imaginative, think outside the box, and encourage creative exploration.
  Use vivid language, metaphors, and help spark new ideas.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    config: { systemInstruction: systemPrompt },
    contents: [
      ...buildConversationContext(conversationHistory),
      { role: "user", parts: [{ text: userMessage }] }
    ],
  });

  const suggestions = [
    "Can you suggest some creative variations?",
    "What would make this more unique?",
    "How can I approach this differently?",
    "What inspires this concept?"
  ];

  return {
    content: response.text || "Let's explore some creative possibilities together!",
    suggestions,
    confidence: 0.8,
    mode: "creative"
  };
}

export async function generateCodeResponse(
  userMessage: string,
  conversationHistory: Array<{ role: string; content: string }> = []
): Promise<ModeResponse> {
  const systemPrompt = `You are a programming expert assistant. Focus on:
  - Clear, well-commented code examples
  - Best practices and conventions
  - Debugging and troubleshooting
  - Code optimization and performance
  - Explaining complex programming concepts
  
  Always provide:
  1. Working code examples
  2. Clear explanations of logic
  3. Best practices
  4. Potential improvements
  5. Testing suggestions`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    config: { systemInstruction: systemPrompt },
    contents: [
      ...buildConversationContext(conversationHistory),
      { role: "user", parts: [{ text: userMessage }] }
    ],
  });

  const suggestions = [
    "Can you explain this code step by step?",
    "How can I optimize this further?",
    "What are the best practices here?",
    "Are there any potential bugs?"
  ];

  return {
    content: response.text || "Let me help you with that code!",
    suggestions,
    confidence: 0.9,
    mode: "code"
  };
}

export async function generateResearchResponse(
  userMessage: string,
  conversationHistory: Array<{ role: string; content: string }> = []
): Promise<ModeResponse> {
  const systemPrompt = `You are a research assistant focused on:
  - In-depth analysis of topics
  - Evidence-based information
  - Multiple perspectives and viewpoints
  - Structured research methodology
  - Critical evaluation of sources
  
  Provide comprehensive, well-structured responses with:
  1. Key findings and insights
  2. Different perspectives
  3. Evidence and reasoning
  4. Areas for further exploration
  5. Reliable sources when possible`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    config: { systemInstruction: systemPrompt },
    contents: [
      ...buildConversationContext(conversationHistory),
      { role: "user", parts: [{ text: userMessage }] }
    ],
  });

  const suggestions = [
    "What are the key research findings?",
    "Are there opposing viewpoints?",
    "What evidence supports this?",
    "What should I research next?"
  ];

  return {
    content: response.text || "Let me help you research this topic thoroughly.",
    suggestions,
    confidence: 0.85,
    mode: "research"
  };
}

function buildConversationContext(history: Array<{ role: string; content: string }>) {
  return history.slice(-8).map(msg => ({
    role: msg.role === "user" ? "user" as const : "model" as const,
    parts: [{ text: msg.content }]
  }));
}

export async function generateSuggestions(
  conversationId: number,
  lastMessage: string,
  mode: string = "general"
): Promise<string[]> {
  const basePrompt = `Based on this conversation and message: "${lastMessage}", suggest 3 helpful follow-up questions or topics that would be valuable to explore next.`;
  
  const modePrompts = {
    tutor: basePrompt + " Focus on learning objectives and skill development.",
    creative: basePrompt + " Focus on creative exploration and new ideas.",
    code: basePrompt + " Focus on technical implementation and best practices.",
    research: basePrompt + " Focus on deeper analysis and related topics.",
    general: basePrompt + " Focus on helpful and relevant continuation."
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: modePrompts[mode] || modePrompts.general }] }],
    });

    const suggestions = response.text?.split('\n')
      .filter(line => line.trim())
      .map(line => line.replace(/^\d+\.\s*/, '').trim())
      .filter(line => line.length > 0)
      .slice(0, 3) || [];

    // Store suggestions in database
    for (const suggestion of suggestions) {
      await storage.createSuggestion({
        conversationId,
        content: suggestion,
        type: 'followup',
        priority: 1,
        used: false
      });
    }

    return suggestions;
  } catch (error) {
    console.error('Error generating suggestions:', error);
    return [];
  }
}