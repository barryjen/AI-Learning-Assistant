import { 
  users, 
  conversations, 
  messages, 
  feedback, 
  learningContext,
  type User, 
  type InsertUser,
  type Conversation,
  type InsertConversation,
  type Message,
  type InsertMessage,
  type Feedback,
  type InsertFeedback,
  type LearningContext,
  type InsertLearningContext
} from "@shared/schema";

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
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private conversations: Map<number, Conversation>;
  private messages: Map<number, Message>;
  private feedback: Map<number, Feedback>;
  private learningContext: LearningContext | undefined;
  
  private userIdCounter: number = 1;
  private conversationIdCounter: number = 1;
  private messageIdCounter: number = 1;
  private feedbackIdCounter: number = 1;
  private learningContextIdCounter: number = 1;

  constructor() {
    this.users = new Map();
    this.conversations = new Map();
    this.messages = new Map();
    this.feedback = new Map();
    this.learningContext = undefined;
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
}

export const storage = new MemStorage();
