import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, MessageCircle, Lightbulb, Code, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Conversation } from "@shared/schema";

interface ChatSidebarProps {
  conversations: Conversation[];
  selectedConversationId: number | null;
  onSelectConversation: (id: number) => void;
  onNewChat: () => void;
  isOpen: boolean;
  onClose: () => void;
  learningStats?: any;
  isLoading: boolean;
}

export function ChatSidebar({
  conversations,
  selectedConversationId,
  onSelectConversation,
  onNewChat,
  isOpen,
  onClose,
  learningStats,
  isLoading,
}: ChatSidebarProps) {
  const getConversationIcon = (index: number) => {
    const icons = [MessageCircle, Lightbulb, Code];
    const Icon = icons[index % icons.length];
    return Icon;
  };

  const getConversationColor = (index: number) => {
    const colors = [
      "bg-blue-500", 
      "bg-orange-500", 
      "bg-green-500",
      "bg-purple-500",
      "bg-red-500",
      "bg-indigo-500"
    ];
    return colors[index % colors.length];
  };

  return (
    <div className={cn(
      "w-80 bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out h-full",
      "lg:translate-x-0 lg:relative lg:z-0",
      isOpen ? "translate-x-0 absolute z-20" : "-translate-x-full absolute z-20"
    )}>
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Conversations</h2>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onNewChat}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg lg:hidden"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-start space-x-3 p-3 animate-pulse">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <MessageCircle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No conversations yet</p>
            <p className="text-xs mt-1">Start a new chat to begin</p>
          </div>
        ) : (
          <div className="py-2">
            {conversations.map((conversation, index) => {
              const Icon = getConversationIcon(index);
              const colorClass = getConversationColor(index);
              
              return (
                <div
                  key={conversation.id}
                  className={cn(
                    "p-3 hover:bg-gray-50 border-b border-gray-100 cursor-pointer transition-colors",
                    selectedConversationId === conversation.id && "bg-blue-50 border-blue-200"
                  )}
                  onClick={() => onSelectConversation(conversation.id)}
                >
                  <div className="flex items-start space-x-3">
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", colorClass)}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {conversation.title}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(conversation.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>

      {/* Learning Stats */}
      {learningStats && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-xs text-gray-600 mb-2">Learning Progress</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-white p-2 rounded">
              <div className="font-medium text-blue-600">
                {learningStats.totalConversations}
              </div>
              <div className="text-gray-500">Conversations</div>
            </div>
            <div className="bg-white p-2 rounded">
              <div className="font-medium text-green-600">
                {learningStats.positiveRating}%
              </div>
              <div className="text-gray-500">Positive</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
