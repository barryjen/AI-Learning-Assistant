import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateResponse, processUserFeedback } from "./services/gemini";
import { 
  insertConversationSchema, 
  insertMessageSchema, 
  insertFeedbackSchema 
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
      const { content } = req.body;
      
      if (!content || typeof content !== "string") {
        return res.status(400).json({ error: "Message content is required" });
      }

      // Store user message
      const userMessage = await storage.createMessage({
        conversationId,
        content,
        role: "user"
      });

      // Get conversation history for context
      const history = await storage.getMessagesByConversation(conversationId);
      const conversationHistory = history.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Generate AI response
      const aiResponse = await generateResponse(content, conversationHistory);
      
      // Store AI response
      const aiMessage = await storage.createMessage({
        conversationId,
        content: aiResponse.content,
        role: "assistant"
      });

      // Update conversation timestamp
      await storage.updateConversation(conversationId, {
        updatedAt: new Date()
      });

      res.json({
        userMessage,
        aiMessage,
        confidence: aiResponse.confidence
      });
    } catch (error) {
      console.error("Error in message endpoint:", error);
      res.status(500).json({ error: "Failed to process message" });
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
        isLearning: false // Will be set by frontend during API calls
      };
      
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch learning stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
