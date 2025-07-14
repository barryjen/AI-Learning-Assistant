import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateResponse, processUserFeedback } from "./services/gemini";
import { 
  generateTutorResponse, 
  generateCreativeResponse, 
  generateCodeResponse, 
  generateResearchResponse,
  generateSuggestions 
} from "./services/ai-modes";
import { 
  insertConversationSchema, 
  insertMessageSchema, 
  insertFeedbackSchema,
  insertUserPreferencesSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get all conversations
  app.get("/api/conversations", async (req, res) => {
    try {
      const conversations = await storage.getConversations();
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  // Create new conversation
  app.post("/api/conversations", async (req, res) => {
    try {
      const validatedData = insertConversationSchema.parse(req.body);
      const conversation = await storage.createConversation(validatedData);
      res.json(conversation);
    } catch (error) {
      res.status(400).json({ error: "Invalid conversation data" });
    }
  });

  // Get messages for a conversation
  app.get("/api/conversations/:id/messages", async (req, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      const messages = await storage.getMessagesByConversation(conversationId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  // Send message and get AI response
  app.post("/api/conversations/:id/messages", async (req, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      const { content, mode = "general", model = "gemini", apiKey } = req.body;
      
      if (!content || typeof content !== "string") {
        return res.status(400).json({ error: "Message content is required" });
      }

      if (!apiKey) {
        return res.status(400).json({ error: "API key is required" });
      }

      // Store user message
      const userMessage = await storage.createMessage({
        conversationId,
        content,
        role: "user",
        model
      });

      // Get conversation history for context
      const history = await storage.getMessagesByConversation(conversationId);
      const conversationHistory = history.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Generate AI response based on mode
      let aiResponse;
      switch (mode) {
        case "tutor":
          aiResponse = await generateTutorResponse(content, conversationHistory, apiKey);
          break;
        case "creative":
          aiResponse = await generateCreativeResponse(content, conversationHistory, apiKey);
          break;
        case "code":
          aiResponse = await generateCodeResponse(content, conversationHistory, apiKey);
          break;
        case "research":
          aiResponse = await generateResearchResponse(content, conversationHistory, apiKey);
          break;
        default:
          aiResponse = await generateResponse(content, conversationHistory, apiKey);
      }
      
      // Store AI response
      const aiMessage = await storage.createMessage({
        conversationId,
        content: aiResponse.content,
        role: "assistant",
        model
      });

      // Update conversation with mode and timestamp
      await storage.updateConversation(conversationId, {
        mode,
        updatedAt: new Date()
      });

      // Generate suggestions for next questions
      const suggestions = await generateSuggestions(conversationId, content, mode);

      res.json({
        userMessage,
        aiMessage,
        confidence: aiResponse.confidence,
        suggestions,
        mode
      });
    } catch (error: any) {
      console.error("Error in message endpoint:", error);
      res.status(500).json({ error: error.message || "Failed to process message" });
    }
  });

  // Test API key endpoint
  app.post("/api/test-api-key", async (req, res) => {
    try {
      const { apiKey } = req.body;
      
      if (!apiKey) {
        return res.status(400).json({ error: "API key is required" });
      }

      // Test the API key with a simple request
      const response = await generateResponse("Hello", [], apiKey);
      
      res.json({ valid: true, message: "API key is valid" });
    } catch (error: any) {
      console.error("API key test error:", error);
      res.status(400).json({ error: error.message || "Invalid API key" });
    }
  });

  // Submit feedback for a message
  app.post("/api/messages/:id/feedback", async (req, res) => {
    try {
      const messageId = parseInt(req.params.id);
      const { rating } = req.body;
      
      if (!rating || !["positive", "negative"].includes(rating)) {
        return res.status(400).json({ error: "Valid rating is required" });
      }

      // Get the message content for learning
      const message = await storage.getMessage(messageId);
      if (!message) {
        return res.status(404).json({ error: "Message not found" });
      }

      // Process feedback and update learning context
      await processUserFeedback(messageId, rating, message.content);
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error processing feedback:", error);
      res.status(500).json({ error: "Failed to process feedback" });
    }
  });

  // Get learning stats
  app.get("/api/learning/stats", async (req, res) => {
    try {
      const conversations = await storage.getConversations();
      const context = await storage.getLearningContext();
      
      const stats = {
        totalConversations: conversations.length,
        positiveRating: context?.averageRating || 0,
        totalFeedback: context?.totalFeedback || 0,
        topicKeywords: context?.topicKeywords || [],
        preferredModes: context?.preferredModes || [],
        learningStyle: context?.learningStyle || "balanced",
        isLearning: false // Will be set by frontend during API calls
      };
      
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch learning stats" });
    }
  });

  // User preferences endpoints
  app.get("/api/preferences", async (req, res) => {
    try {
      const preferences = await storage.getUserPreferences();
      res.json(preferences || {
        theme: "light",
        defaultModel: "gemini",
        voiceEnabled: false,
        autoSuggestions: true
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch preferences" });
    }
  });

  app.post("/api/preferences", async (req, res) => {
    try {
      const existing = await storage.getUserPreferences();
      let preferences;
      
      if (existing) {
        preferences = await storage.updateUserPreferences(req.body);
      } else {
        preferences = await storage.createUserPreferences(req.body);
      }
      
      res.json(preferences);
    } catch (error) {
      res.status(500).json({ error: "Failed to update preferences" });
    }
  });

  // Suggestions endpoints
  app.get("/api/conversations/:id/suggestions", async (req, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      const suggestions = await storage.getSuggestionsByConversation(conversationId);
      res.json(suggestions.filter(s => !s.used));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch suggestions" });
    }
  });

  app.post("/api/suggestions/:id/use", async (req, res) => {
    try {
      const suggestionId = parseInt(req.params.id);
      await storage.markSuggestionUsed(suggestionId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to mark suggestion as used" });
    }
  });

  // Analytics endpoints
  app.get("/api/analytics", async (req, res) => {
    try {
      const analytics = await storage.getAnalytics();
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  // Search conversations
  app.get("/api/search", async (req, res) => {
    try {
      const { q } = req.query;
      if (!q || typeof q !== "string") {
        return res.status(400).json({ error: "Search query is required" });
      }
      
      const conversations = await storage.getConversations();
      const searchResults = conversations.filter(conv => 
        conv.title.toLowerCase().includes(q.toLowerCase()) ||
        conv.summary?.toLowerCase().includes(q.toLowerCase())
      );
      
      res.json(searchResults);
    } catch (error) {
      res.status(500).json({ error: "Failed to search conversations" });
    }
  });

  // Export conversation
  app.get("/api/conversations/:id/export", async (req, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      const conversation = await storage.getConversation(conversationId);
      const messages = await storage.getMessagesByConversation(conversationId);
      
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }
      
      const exportData = {
        conversation,
        messages,
        exportedAt: new Date().toISOString()
      };
      
      res.json(exportData);
    } catch (error) {
      res.status(500).json({ error: "Failed to export conversation" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
