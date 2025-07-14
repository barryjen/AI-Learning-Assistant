import { 
  users, 
  conversations, 
  messages, 
  feedback, 
  learningContext,
  userPreferences,
  suggestions,
  analytics,
  type User, 
  type InsertUser,
  type Conversation,
  type InsertConversation,
  type Message,
  type InsertMessage,
  type Feedback,
  type InsertFeedback,
  type LearningContext,
  type InsertLearningContext,
  type UserPreferences,
  type InsertUserPreferences,
  type Suggestion,
  type InsertSuggestion,
  type Analytics,
  type InsertAnalytics
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Conversations
  getConversations(): Promise<Conversation[]>;
  getConversation(id: number): Promise<Conversation | undefined>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  updateConversation(id: number, updates: Partial<Conversation>): Promise<Conversation | undefined>;
  
  // Messages
  getMessagesByConversation(conversationId: number): Promise<Message[]>;
  getMessage(id: number): Promise<Message | undefined>;
  createMessage(message: InsertMessage): Promise<Message>;
  
  // Feedback
  getFeedbackByMessage(messageId: number): Promise<Feedback[]>;
  createFeedback(feedback: InsertFeedback): Promise<Feedback>;
  
  // Learning Context
  getLearningContext(): Promise<LearningContext | undefined>;
  createLearningContext(context: InsertLearningContext): Promise<LearningContext>;
  updateLearningContext(updates: Partial<LearningContext>): Promise<LearningContext | undefined>;
  
  // User Preferences
  getUserPreferences(userId?: number): Promise<UserPreferences | undefined>;
  createUserPreferences(preferences: InsertUserPreferences): Promise<UserPreferences>;
  updateUserPreferences(updates: Partial<UserPreferences>): Promise<UserPreferences | undefined>;
  
  // Suggestions
  getSuggestionsByConversation(conversationId: number): Promise<Suggestion[]>;
  createSuggestion(suggestion: InsertSuggestion): Promise<Suggestion>;
  markSuggestionUsed(id: number): Promise<void>;
  
  // Analytics
  getAnalytics(): Promise<Analytics[]>;
  createAnalytics(analytics: InsertAnalytics): Promise<Analytics>;
  updateAnalytics(updates: Partial<Analytics>): Promise<Analytics | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getConversations(): Promise<Conversation[]> {
    const result = await db
      .select()
      .from(conversations)
      .orderBy(conversations.updatedAt);
    return result.reverse();
  }

  async getConversation(id: number): Promise<Conversation | undefined> {
    const [conversation] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, id));
    return conversation || undefined;
  }

  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const [conversation] = await db
      .insert(conversations)
      .values({
        ...insertConversation,
        mode: insertConversation.mode || null,
        tags: insertConversation.tags || null,
        summary: insertConversation.summary || null
      })
      .returning();
    return conversation;
  }

  async updateConversation(id: number, updates: Partial<Conversation>): Promise<Conversation | undefined> {
    const [conversation] = await db
      .update(conversations)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(conversations.id, id))
      .returning();
    return conversation || undefined;
  }

  async getMessagesByConversation(conversationId: number): Promise<Message[]> {
    const result = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.timestamp);
    return result;
  }

  async getMessage(id: number): Promise<Message | undefined> {
    const [message] = await db
      .select()
      .from(messages)
      .where(eq(messages.id, id));
    return message || undefined;
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values({
        ...insertMessage,
        model: insertMessage.model || null,
        attachments: insertMessage.attachments || null,
        codeBlocks: insertMessage.codeBlocks || null
      })
      .returning();
    return message;
  }

  async getFeedbackByMessage(messageId: number): Promise<Feedback[]> {
    const result = await db
      .select()
      .from(feedback)
      .where(eq(feedback.messageId, messageId));
    return result;
  }

  async createFeedback(insertFeedback: InsertFeedback): Promise<Feedback> {
    const [feedbackItem] = await db
      .insert(feedback)
      .values(insertFeedback)
      .returning();
    return feedbackItem;
  }

  async getLearningContext(): Promise<LearningContext | undefined> {
    const [context] = await db
      .select()
      .from(learningContext)
      .limit(1);
    return context || undefined;
  }

  async createLearningContext(insertContext: InsertLearningContext): Promise<LearningContext> {
    const [context] = await db
      .insert(learningContext)
      .values({
        ...insertContext,
        topicKeywords: insertContext.topicKeywords || null,
        positivePatterns: insertContext.positivePatterns || null,
        negativePatterns: insertContext.negativePatterns || null,
        averageRating: insertContext.averageRating || null,
        totalFeedback: insertContext.totalFeedback || null,
        preferredModes: insertContext.preferredModes || null,
        learningStyle: insertContext.learningStyle || null
      })
      .returning();
    return context;
  }

  async updateLearningContext(updates: Partial<LearningContext>): Promise<LearningContext | undefined> {
    const existingContext = await this.getLearningContext();
    if (!existingContext) return undefined;
    
    const [context] = await db
      .update(learningContext)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(learningContext.id, existingContext.id))
      .returning();
    return context || undefined;
  }

  // User Preferences
  async getUserPreferences(userId: number = 1): Promise<UserPreferences | undefined> {
    const [preferences] = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId))
      .limit(1);
    return preferences || undefined;
  }

  async createUserPreferences(insertPreferences: InsertUserPreferences): Promise<UserPreferences> {
    const [preferences] = await db
      .insert(userPreferences)
      .values(insertPreferences)
      .returning();
    return preferences;
  }

  async updateUserPreferences(updates: Partial<UserPreferences>): Promise<UserPreferences | undefined> {
    const existing = await this.getUserPreferences(updates.userId || 1);
    if (!existing) return undefined;
    
    const [preferences] = await db
      .update(userPreferences)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(userPreferences.id, existing.id))
      .returning();
    return preferences || undefined;
  }

  // Suggestions
  async getSuggestionsByConversation(conversationId: number): Promise<Suggestion[]> {
    const result = await db
      .select()
      .from(suggestions)
      .where(eq(suggestions.conversationId, conversationId))
      .orderBy(suggestions.priority, suggestions.createdAt);
    return result;
  }

  async createSuggestion(insertSuggestion: InsertSuggestion): Promise<Suggestion> {
    const [suggestion] = await db
      .insert(suggestions)
      .values(insertSuggestion)
      .returning();
    return suggestion;
  }

  async markSuggestionUsed(id: number): Promise<void> {
    await db
      .update(suggestions)
      .set({ used: true })
      .where(eq(suggestions.id, id));
  }

  // Analytics
  async getAnalytics(): Promise<Analytics[]> {
    const result = await db
      .select()
      .from(analytics)
      .orderBy(analytics.date);
    return result;
  }

  async createAnalytics(insertAnalytics: InsertAnalytics): Promise<Analytics> {
    const [analyticsRecord] = await db
      .insert(analytics)
      .values(insertAnalytics)
      .returning();
    return analyticsRecord;
  }

  async updateAnalytics(updates: Partial<Analytics>): Promise<Analytics | undefined> {
    const latestAnalytics = await db
      .select()
      .from(analytics)
      .orderBy(analytics.date)
      .limit(1);
    
    if (latestAnalytics.length === 0) return undefined;
    
    const [analyticsRecord] = await db
      .update(analytics)
      .set(updates)
      .where(eq(analytics.id, latestAnalytics[0].id))
      .returning();
    return analyticsRecord || undefined;
  }
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private conversations: Map<number, Conversation>;
  private messages: Map<number, Message>;
  private feedback: Map<number, Feedback>;
  private learningContext: LearningContext | undefined;
  private userPreferences: Map<number, UserPreferences>;
  private suggestions: Map<number, Suggestion>;
  private analytics: Map<number, Analytics>;
  
  private userIdCounter: number = 1;
  private conversationIdCounter: number = 1;
  private messageIdCounter: number = 1;
  private feedbackIdCounter: number = 1;
  private learningContextIdCounter: number = 1;
  private preferencesIdCounter: number = 1;
  private suggestionsIdCounter: number = 1;
  private analyticsIdCounter: number = 1;

  constructor() {
    this.users = new Map();
    this.conversations = new Map();
    this.messages = new Map();
    this.feedback = new Map();
    this.learningContext = undefined;
    this.userPreferences = new Map();
    this.suggestions = new Map();
    this.analytics = new Map();
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getConversations(): Promise<Conversation[]> {
    return Array.from(this.conversations.values()).sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  async getConversation(id: number): Promise<Conversation | undefined> {
    return this.conversations.get(id);
  }

  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const id = this.conversationIdCounter++;
    const now = new Date();
    const conversation: Conversation = { 
      ...insertConversation, 
      id,
      mode: insertConversation.mode || null,
      tags: insertConversation.tags || null,
      summary: insertConversation.summary || null,
      createdAt: now,
      updatedAt: now
    };
    this.conversations.set(id, conversation);
    return conversation;
  }

  async updateConversation(id: number, updates: Partial<Conversation>): Promise<Conversation | undefined> {
    const conversation = this.conversations.get(id);
    if (!conversation) return undefined;
    
    const updated = { ...conversation, ...updates, updatedAt: new Date() };
    this.conversations.set(id, updated);
    return updated;
  }

  async getMessagesByConversation(conversationId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => message.conversationId === conversationId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  async getMessage(id: number): Promise<Message | undefined> {
    return this.messages.get(id);
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.messageIdCounter++;
    const message: Message = { 
      ...insertMessage, 
      id,
      model: insertMessage.model || null,
      attachments: insertMessage.attachments || null,
      codeBlocks: insertMessage.codeBlocks || null,
      timestamp: new Date()
    };
    this.messages.set(id, message);
    return message;
  }

  async getFeedbackByMessage(messageId: number): Promise<Feedback[]> {
    return Array.from(this.feedback.values())
      .filter(fb => fb.messageId === messageId);
  }

  async createFeedback(insertFeedback: InsertFeedback): Promise<Feedback> {
    const id = this.feedbackIdCounter++;
    const feedbackItem: Feedback = { 
      ...insertFeedback, 
      id,
      timestamp: new Date()
    };
    this.feedback.set(id, feedbackItem);
    return feedbackItem;
  }

  async getLearningContext(): Promise<LearningContext | undefined> {
    return this.learningContext;
  }

  async createLearningContext(insertContext: InsertLearningContext): Promise<LearningContext> {
    const id = this.learningContextIdCounter++;
    const context: LearningContext = { 
      topicKeywords: insertContext.topicKeywords || null,
      positivePatterns: insertContext.positivePatterns || null,
      negativePatterns: insertContext.negativePatterns || null,
      averageRating: insertContext.averageRating || null,
      totalFeedback: insertContext.totalFeedback || null,
      preferredModes: insertContext.preferredModes || null,
      learningStyle: insertContext.learningStyle || null,
      id,
      updatedAt: new Date()
    };
    this.learningContext = context;
    return context;
  }

  async updateLearningContext(updates: Partial<LearningContext>): Promise<LearningContext | undefined> {
    if (!this.learningContext) return undefined;
    
    const updated = { ...this.learningContext, ...updates, updatedAt: new Date() };
    this.learningContext = updated;
    return updated;
  }

  // User Preferences
  async getUserPreferences(userId: number = 1): Promise<UserPreferences | undefined> {
    return Array.from(this.userPreferences.values()).find(p => p.userId === userId);
  }

  async createUserPreferences(insertPreferences: InsertUserPreferences): Promise<UserPreferences> {
    const id = this.preferencesIdCounter++;
    const preferences: UserPreferences = {
      userId: insertPreferences.userId || null,
      theme: insertPreferences.theme || null,
      defaultModel: insertPreferences.defaultModel || null,
      voiceEnabled: insertPreferences.voiceEnabled || null,
      autoSuggestions: insertPreferences.autoSuggestions || null,
      id,
      updatedAt: new Date()
    };
    this.userPreferences.set(id, preferences);
    return preferences;
  }

  async updateUserPreferences(updates: Partial<UserPreferences>): Promise<UserPreferences | undefined> {
    const existing = await this.getUserPreferences(updates.userId || 1);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates, updatedAt: new Date() };
    this.userPreferences.set(existing.id, updated);
    return updated;
  }

  // Suggestions
  async getSuggestionsByConversation(conversationId: number): Promise<Suggestion[]> {
    return Array.from(this.suggestions.values())
      .filter(s => s.conversationId === conversationId)
      .sort((a, b) => (a.priority || 0) - (b.priority || 0));
  }

  async createSuggestion(insertSuggestion: InsertSuggestion): Promise<Suggestion> {
    const id = this.suggestionsIdCounter++;
    const suggestion: Suggestion = {
      conversationId: insertSuggestion.conversationId,
      content: insertSuggestion.content,
      type: insertSuggestion.type,
      priority: insertSuggestion.priority || null,
      used: insertSuggestion.used || null,
      id,
      createdAt: new Date()
    };
    this.suggestions.set(id, suggestion);
    return suggestion;
  }

  async markSuggestionUsed(id: number): Promise<void> {
    const suggestion = this.suggestions.get(id);
    if (suggestion) {
      suggestion.used = true;
      this.suggestions.set(id, suggestion);
    }
  }

  // Analytics
  async getAnalytics(): Promise<Analytics[]> {
    return Array.from(this.analytics.values()).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }

  async createAnalytics(insertAnalytics: InsertAnalytics): Promise<Analytics> {
    const id = this.analyticsIdCounter++;
    const analytics: Analytics = {
      date: insertAnalytics.date || new Date(),
      totalMessages: insertAnalytics.totalMessages || null,
      totalConversations: insertAnalytics.totalConversations || null,
      averageRating: insertAnalytics.averageRating || null,
      topicsDiscussed: insertAnalytics.topicsDiscussed || null,
      mostUsedMode: insertAnalytics.mostUsedMode || null,
      feedbackCount: insertAnalytics.feedbackCount || null,
      id
    };
    this.analytics.set(id, analytics);
    return analytics;
  }

  async updateAnalytics(updates: Partial<Analytics>): Promise<Analytics | undefined> {
    const latestAnalytics = Array.from(this.analytics.values())
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    
    if (!latestAnalytics) return undefined;
    
    const updated = { ...latestAnalytics, ...updates };
    this.analytics.set(latestAnalytics.id, updated);
    return updated;
  }
}

export const storage = new DatabaseStorage();
