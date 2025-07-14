import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { ChatHeader } from "@/components/chat/chat-header";
import { ChatMessages } from "@/components/chat/chat-messages";
import { ChatInput } from "@/components/chat/chat-input";
import { useToast } from "@/hooks/use-toast";
import type { Conversation, Message } from "@shared/schema";

export default function Chat() {
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLearning, setIsLearning] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch conversations
  const { data: conversations = [], isLoading: conversationsLoading } = useQuery<Conversation[]>({
    queryKey: ["/api/conversations"],
  });

  // Fetch messages for selected conversation
  const { data: messages = [], isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ["/api/conversations", selectedConversationId, "messages"],
    enabled: !!selectedConversationId,
  });

  // Fetch learning stats
  const { data: learningStats } = useQuery({
    queryKey: ["/api/learning/stats"],
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Create new conversation
  const createConversationMutation = useMutation({
    mutationFn: async (title: string) => {
      const response = await apiRequest("POST", "/api/conversations", { title });
      return response.json();
    },
    onSuccess: (newConversation) => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      setSelectedConversationId(newConversation.id);
      setSidebarOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create new conversation",
        variant: "destructive",
      });
    },
  });

  // Send message
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!selectedConversationId) throw new Error("No conversation selected");
      const response = await apiRequest("POST", `/api/conversations/${selectedConversationId}/messages`, { content });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations", selectedConversationId, "messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    },
  });

  // Submit feedback
  const submitFeedbackMutation = useMutation({
    mutationFn: async ({ messageId, rating }: { messageId: number; rating: "positive" | "negative" }) => {
      const response = await apiRequest("POST", `/api/messages/${messageId}/feedback`, { rating });
      return response.json();
    },
    onSuccess: () => {
      setIsLearning(true);
      queryClient.invalidateQueries({ queryKey: ["/api/learning/stats"] });
      
      // Hide learning indicator after 3 seconds
      setTimeout(() => setIsLearning(false), 3000);
      
      toast({
        title: "Thank you!",
        description: "Your feedback helps me improve",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit feedback",
        variant: "destructive",
      });
    },
  });

  const handleNewChat = () => {
    const title = `New conversation ${new Date().toLocaleString()}`;
    createConversationMutation.mutate(title);
  };

  const handleSendMessage = async (content: string) => {
    if (!selectedConversationId) {
      // Create new conversation first
      const title = content.slice(0, 50) + (content.length > 50 ? "..." : "");
      createConversationMutation.mutate(title);
      // Wait for conversation to be created, then send message
      setTimeout(() => {
        sendMessageMutation.mutate(content);
      }, 100);
    } else {
      sendMessageMutation.mutate(content);
    }
  };

  const handleFeedback = (messageId: number, rating: "positive" | "negative") => {
    submitFeedbackMutation.mutate({ messageId, rating });
  };

  // Auto-select first conversation if none selected
  useEffect(() => {
    if (!selectedConversationId && conversations.length > 0) {
      setSelectedConversationId(conversations[0].id);
    }
  }, [conversations, selectedConversationId]);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <ChatSidebar
        conversations={conversations}
        selectedConversationId={selectedConversationId}
        onSelectConversation={setSelectedConversationId}
        onNewChat={handleNewChat}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        learningStats={learningStats}
        isLoading={conversationsLoading}
      />

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <ChatHeader
          isLearning={isLearning}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />
        
        <ChatMessages
          messages={messages}
          isLoading={messagesLoading || sendMessageMutation.isPending}
          onFeedback={handleFeedback}
        />
        
        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={sendMessageMutation.isPending}
        />
      </div>
    </div>
  );
}
