import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  mode: text("mode").default("general"), // 'general', 'tutor', 'creative', 'code', 'research'
  tags: text("tags").array(),
  summary: text("summary"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull(),
  content: text("content").notNull(),
  role: text("role").notNull(), // 'user' or 'assistant'
  model: text("model").default("gemini"), // 'gemini', 'gpt', 'claude'
  attachments: text("attachments").array(), // file paths or URLs
  codeBlocks: text("code_blocks").array(), // extracted code snippets
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const feedback = pgTable("feedback", {
  id: serial("id").primaryKey(),
  messageId: integer("message_id").notNull(),
  rating: text("rating").notNull(), // 'positive' or 'negative'
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const learningContext = pgTable("learning_context", {
  id: serial("id").primaryKey(),
  topicKeywords: text("topic_keywords").array(),
  positivePatterns: text("positive_patterns").array(),
  negativePatterns: text("negative_patterns").array(),
  averageRating: integer("average_rating").default(0),
  totalFeedback: integer("total_feedback").default(0),
  preferredModes: text("preferred_modes").array(),
  learningStyle: text("learning_style").default("balanced"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// New tables for advanced features
export const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").default(1),
  theme: text("theme").default("light"),
  defaultModel: text("default_model").default("gemini"),
  voiceEnabled: boolean("voice_enabled").default(false),
  autoSuggestions: boolean("auto_suggestions").default(true),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const suggestions = pgTable("suggestions", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull(),
  content: text("content").notNull(),
  type: text("type").notNull(), // 'followup', 'clarification', 'topic'
  priority: integer("priority").default(1),
  used: boolean("used").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const analytics = pgTable("analytics", {
  id: serial("id").primaryKey(),
  date: timestamp("date").defaultNow().notNull(),
  totalMessages: integer("total_messages").default(0),
  totalConversations: integer("total_conversations").default(0),
  averageRating: integer("average_rating").default(0),
  topicsDiscussed: text("topics_discussed").array(),
  mostUsedMode: text("most_used_mode").default("general"),
  feedbackCount: integer("feedback_count").default(0),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserPreferencesSchema = createInsertSchema(userPreferences).omit({
  id: true,
  updatedAt: true,
});

export const insertSuggestionSchema = createInsertSchema(suggestions).omit({
  id: true,
  createdAt: true,
});

export const insertAnalyticsSchema = createInsertSchema(analytics).omit({
  id: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  timestamp: true,
});

export const insertFeedbackSchema = createInsertSchema(feedback).omit({
  id: true,
  timestamp: true,
});

export const insertLearningContextSchema = createInsertSchema(learningContext).omit({
  id: true,
  updatedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;
export type Feedback = typeof feedback.$inferSelect;

export type InsertLearningContext = z.infer<typeof insertLearningContextSchema>;
export type LearningContext = typeof learningContext.$inferSelect;

export type InsertUserPreferences = z.infer<typeof insertUserPreferencesSchema>;
export type UserPreferences = typeof userPreferences.$inferSelect;

export type InsertSuggestion = z.infer<typeof insertSuggestionSchema>;
export type Suggestion = typeof suggestions.$inferSelect;

export type InsertAnalytics = z.infer<typeof insertAnalyticsSchema>;
export type Analytics = typeof analytics.$inferSelect;
