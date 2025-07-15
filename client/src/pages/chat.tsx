import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { ChatHeader } from "@/components/chat/chat-header";
import { ChatMessages } from "@/components/chat/chat-messages";
import { ChatInput } from "@/components/chat/chat-input";
import { ModeSelector } from "@/components/chat/mode-selector";
import { Suggestions } from "@/components/chat/suggestions";
import { LearningProgress } from "@/components/chat/learning-progress";
import { SearchFilter } from "@/components/chat/search-filter";
import { SettingsPanel } from "@/components/chat/settings-panel";
import { ApiKeySetup } from "@/components/auth/api-key-setup";
import { useApiKey } from "@/hooks/use-api-key";
import { useToast } from "@/hooks/use-toast";
import type { Conversation, Message } from "@shared/schema";

export default function Chat() {
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLearning, setIsLearning] = useState(false);
  const [currentMode, setCurrentMode] = useState("general");
  const [currentModel, setCurrentModel] = useState("gemini");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState({});
  const [showApiKeySetup, setShowApiKeySetup] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { 
    preferredProvider, 
    hasAnyApiKey, 
    hasApiKey, 
    getCurrentApiKey, 
    saveApiKey, 
    clearApiKey,
    setPreferredProvider 
  } = useApiKey();

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

  // Fetch user preferences
  const { data: preferences } = useQuery({
    queryKey: ["/api/preferences"],
  });

  // Fetch suggestions for current conversation
  const { data: suggestions = [] } = useQuery({
    queryKey: ["/api/conversations", selectedConversationId, "suggestions"],
    enabled: !!selectedConversationId,
  });

  // Fetch search results
  const { data: searchResults = [] } = useQuery({
    queryKey: ["/api/search", searchQuery],
    enabled: !!searchQuery,
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
      
      const currentApiKey = getCurrentApiKey(currentModel === "openai" || currentModel === "gpt-4o" ? "openai" : "gemini");
      if (!currentApiKey) throw new Error("API key required");
      
      const response = await apiRequest("POST", `/api/conversations/${selectedConversationId}/messages`, { 
        content,
        mode: currentMode,
        model: currentModel,
        apiKey: currentApiKey
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations", selectedConversationId, "messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/conversations", selectedConversationId, "suggestions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/learning/stats"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    },
  });

  // Update preferences
  const updatePreferencesMutation = useMutation({
    mutationFn: async (updates: any) => {
      const response = await apiRequest("POST", "/api/preferences", updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/preferences"] });
      toast({
        title: "Settings Updated",
        description: "Your preferences have been saved",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update preferences",
        variant: "destructive",
      });
    },
  });

  // Use suggestion
  const useSuggestionMutation = useMutation({
    mutationFn: async (suggestionId: number) => {
      const response = await apiRequest("POST", `/api/suggestions/${suggestionId}/use`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations", selectedConversationId, "suggestions"] });
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

  const handleSuggestionClick = (content: string, suggestionId: number) => {
    handleSendMessage(content);
    useSuggestionMutation.mutate(suggestionId);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilter = (filters: any) => {
    setActiveFilters(filters);
  };

  const handleExportData = async () => {
    try {
      const response = await apiRequest("GET", `/api/conversations/${selectedConversationId}/export`);
      const data = await response.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `conversation-${selectedConversationId}-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export data",
        variant: "destructive",
      });
    }
  };

  const handleImportData = (data: any) => {
    // This would typically involve creating new conversations/messages
    console.log("Import data:", data);
    toast({
      title: "Import",
      description: "Data import feature coming soon",
    });
  };

  const handleClearData = () => {
    if (confirm("Are you sure you want to clear all data? This action cannot be undone.")) {
      // Implementation would involve clearing all conversations
      toast({
        title: "Clear Data",
        description: "Data clearing feature coming soon",
      });
    }
  };

  // Auto-select first conversation if none selected
  useEffect(() => {
    if (!selectedConversationId && conversations.length > 0) {
      setSelectedConversationId(conversations[0].id);
    }
  }, [conversations, selectedConversationId]);

  // Check if API key is needed
  useEffect(() => {
    if (!hasAnyApiKey()) {
      setShowApiKeySetup(true);
    }
  }, [hasAnyApiKey]);

  const handleApiKeySet = (newApiKey: string, provider: string) => {
    saveApiKey(newApiKey, provider);
    setShowApiKeySetup(false);
    toast({
      title: "API Key Set",
      description: `Your ${provider === "gemini" ? "Gemini" : "OpenAI"} API key has been saved successfully.`,
    });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* API Key Setup Dialog */}
      <ApiKeySetup
        isOpen={showApiKeySetup}
        onApiKeySet={handleApiKeySet}
        onClose={() => setShowApiKeySetup(false)}
      />

      {/* Enhanced Sidebar */}
      <div className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} fixed inset-y-0 left-0 z-50 w-80 bg-background border-r transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex flex-col h-full">
          {/* Search and Filter */}
          <div className="p-4 border-b">
            <SearchFilter 
              onSearch={handleSearch}
              onFilter={handleFilter}
              searchPlaceholder="Search conversations..."
            />
          </div>
          
          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            <ChatSidebar
              conversations={searchQuery ? searchResults : conversations}
              selectedConversationId={selectedConversationId}
              onSelectConversation={setSelectedConversationId}
              onNewChat={handleNewChat}
              isOpen={true}
              onClose={() => setSidebarOpen(false)}
              learningStats={learningStats}
              isLoading={conversationsLoading}
            />
          </div>
          
          {/* Learning Progress */}
          <div className="p-4 border-t">
            <LearningProgress 
              stats={learningStats || {
                totalConversations: 0,
                positiveRating: 0,
                totalFeedback: 0,
                topicKeywords: [],
                preferredModes: [],
                learningStyle: "balanced",
                isLearning
              }}
            />
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col lg:ml-80">
        {/* Enhanced Header */}
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="p-4 space-y-4">
            {/* Top Header */}
            <div className="flex items-center justify-between">
              <ChatHeader
                isLearning={isLearning}
                onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                currentModel={currentModel}
                onModelChange={setCurrentModel}
                availableModels={["gemini", "gpt-4o"]}
                hasGeminiKey={hasApiKey("gemini")}
                hasOpenAIKey={hasApiKey("openai")}
              />
              <SettingsPanel
                preferences={preferences || {
                  theme: "light",
                  defaultModel: "gemini",
                  voiceEnabled: false,
                  autoSuggestions: true
                }}
                onUpdatePreferences={(updates) => updatePreferencesMutation.mutate(updates)}
                onExportData={handleExportData}
                onImportData={handleImportData}
                onClearData={handleClearData}
              />
            </div>
            
            {/* Mode Selector */}
            <ModeSelector
              currentMode={currentMode}
              currentModel={currentModel}
              onModeChange={setCurrentMode}
              onModelChange={setCurrentModel}
              isLearning={isLearning}
            />
          </div>
        </div>
        
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
          <ChatMessages
            messages={messages}
            isLoading={messagesLoading || sendMessageMutation.isPending}
            onFeedback={handleFeedback}
          />
        </div>
        
        {/* Suggestions */}
        {selectedConversationId && suggestions.length > 0 && (
          <div className="border-t p-4 bg-muted/20">
            <Suggestions
              suggestions={suggestions}
              onSuggestionClick={handleSuggestionClick}
              mode={currentMode}
            />
          </div>
        )}
        
        {/* Input Area */}
        <div className="border-t p-4 bg-background">
          <ChatInput
            onSendMessage={handleSendMessage}
            isLoading={sendMessageMutation.isPending}
          />
        </div>
      </div>
    </div>
  );
}
