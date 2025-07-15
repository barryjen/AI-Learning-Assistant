import OpenAI from "openai";
import { storage } from "../storage";
import type { LearningContext } from "@shared/schema";

// Create OpenAI instance with user's API key
function createOpenAIClient(apiKey: string) {
  return new OpenAI({ apiKey });
}

export interface ModeResponse {
  content: string;
  suggestions: string[];
  confidence: number;
  mode: string;
}

export async function generateTutorResponse(
  userMessage: string,
  conversationHistory: Array<{ role: string; content: string }> = [],
  apiKey?: string
): Promise<ModeResponse> {
  if (!apiKey) {
    throw new Error("API key is required");
  }

  const openai = createOpenAIClient(apiKey);
  
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

  // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      ...buildConversationContext(conversationHistory),
      { role: "user", content: userMessage }
    ],
    max_tokens: 1000,
    temperature: 0.7,
  });

  const suggestions = [
    "Can you give me a practical example?",
    "What's the most important concept to remember?",
    "How can I practice this skill?",
    "What are common mistakes to avoid?"
  ];

  return {
    content: response.choices[0].message.content || "I'd be happy to help you learn this topic step by step.",
    suggestions,
    confidence: 0.85,
    mode: "tutor"
  };
}

export async function generateCreativeResponse(
  userMessage: string,
  conversationHistory: Array<{ role: string; content: string }> = [],
  apiKey?: string
): Promise<ModeResponse> {
  if (!apiKey) {
    throw new Error("API key is required");
  }

  const openai = createOpenAIClient(apiKey);
  
  const systemPrompt = `You are a creative assistant focused on:
  - Brainstorming and idea generation
  - Creative writing and storytelling
  - Artistic and design thinking
  - Innovative problem-solving approaches
  - Inspirational and imaginative responses
  
  Be imaginative, think outside the box, and encourage creative exploration.
  Use vivid language, metaphors, and help spark new ideas.`;

  // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      ...buildConversationContext(conversationHistory),
      { role: "user", content: userMessage }
    ],
    max_tokens: 1000,
    temperature: 0.9, // Higher temperature for more creativity
  });

  const suggestions = [
    "Let's explore a different angle",
    "What if we tried something completely new?",
    "Can you help me brainstorm more ideas?",
    "How can we make this more creative?"
  ];

  return {
    content: response.choices[0].message.content || "Let's explore this creative challenge together!",
    suggestions,
    confidence: 0.8,
    mode: "creative"
  };
}

export async function generateCodeResponse(
  userMessage: string,
  conversationHistory: Array<{ role: string; content: string }> = [],
  apiKey?: string
): Promise<ModeResponse> {
  if (!apiKey) {
    throw new Error("API key is required");
  }

  const openai = createOpenAIClient(apiKey);
  
  const systemPrompt = `You are a programming expert assistant. Focus on:
  - Writing clean, efficient, and well-documented code
  - Explaining programming concepts clearly
  - Providing best practices and optimization tips
  - Debugging and troubleshooting code issues
  - Suggesting modern frameworks and tools
  
  Always include:
  - Code examples with explanations
  - Best practices and conventions
  - Potential pitfalls and how to avoid them
  - Alternative approaches when applicable`;

  // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      ...buildConversationContext(conversationHistory),
      { role: "user", content: userMessage }
    ],
    max_tokens: 1500, // More tokens for code examples
    temperature: 0.3, // Lower temperature for more precise code
  });

  const suggestions = [
    "Can you show me a working example?",
    "What are the best practices for this?",
    "How can I optimize this code?",
    "Are there any common errors to avoid?"
  ];

  return {
    content: response.choices[0].message.content || "Let me help you with your programming challenge.",
    suggestions,
    confidence: 0.9,
    mode: "code"
  };
}

export async function generateResearchResponse(
  userMessage: string,
  conversationHistory: Array<{ role: string; content: string }> = [],
  apiKey?: string
): Promise<ModeResponse> {
  if (!apiKey) {
    throw new Error("API key is required");
  }

  const openai = createOpenAIClient(apiKey);
  
  const systemPrompt = `You are a research assistant focused on:
  - Providing comprehensive, well-researched information
  - Citing reliable sources and methodologies
  - Analyzing data and drawing insights
  - Presenting findings in a structured format
  - Suggesting further research directions
  
  Always structure your responses with:
  - Clear thesis or main points
  - Supporting evidence and examples
  - Multiple perspectives when relevant
  - Limitations and areas for further study`;

  // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      ...buildConversationContext(conversationHistory),
      { role: "user", content: userMessage }
    ],
    max_tokens: 1200,
    temperature: 0.4, // Lower temperature for more factual responses
  });

  const suggestions = [
    "Can you provide more sources on this topic?",
    "What are the different perspectives on this?",
    "How recent is this information?",
    "What are the key findings I should know?"
  ];

  return {
    content: response.choices[0].message.content || "Let me help you research this topic thoroughly.",
    suggestions,
    confidence: 0.85,
    mode: "research"
  };
}

function buildConversationContext(history: Array<{ role: string; content: string }>) {
  return history.slice(-10).map(msg => ({
    role: msg.role === "user" ? "user" as const : "assistant" as const,
    content: msg.content
  }));
}

export async function generateSuggestions(
  conversationId: number,
  lastMessage: string,
  mode: string,
  apiKey?: string
): Promise<any[]> {
  // For now, return mode-specific suggestions
  const baseSuggestions = {
    tutor: [
      { type: "clarification", content: "Can you explain this concept differently?" },
      { type: "follow-up", content: "What should I learn next?" },
      { type: "practice", content: "Can you give me a practice problem?" }
    ],
    creative: [
      { type: "brainstorm", content: "Let's explore more creative ideas" },
      { type: "inspiration", content: "What are some unique approaches?" },
      { type: "expand", content: "How can we build on this idea?" }
    ],
    code: [
      { type: "example", content: "Show me a working code example" },
      { type: "debug", content: "Help me debug this issue" },
      { type: "optimize", content: "How can I improve this code?" }
    ],
    research: [
      { type: "sources", content: "What are the key sources on this topic?" },
      { type: "analysis", content: "What are the main findings?" },
      { type: "perspective", content: "What are different viewpoints?" }
    ]
  };

  const suggestions = baseSuggestions[mode] || baseSuggestions.tutor;
  
  return suggestions.map((suggestion, index) => ({
    id: Date.now() + index,
    conversationId,
    type: suggestion.type,
    content: suggestion.content,
    priority: index + 1,
    used: false,
    createdAt: new Date()
  }));
}