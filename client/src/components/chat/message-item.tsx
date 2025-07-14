import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bot, User, ThumbsUp, ThumbsDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Message } from "@shared/schema";

interface MessageItemProps {
  message: Message;
  onFeedback: (messageId: number, rating: "positive" | "negative") => void;
}

export function MessageItem({ message, onFeedback }: MessageItemProps) {
  const [feedbackGiven, setFeedbackGiven] = useState<"positive" | "negative" | null>(null);
  const isUser = message.role === "user";

  const handleFeedback = (rating: "positive" | "negative") => {
    setFeedbackGiven(rating);
    onFeedback(message.id, rating);
  };

  const formatTimestamp = (timestamp: Date) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={cn(
      "flex items-start space-x-3",
      isUser && "flex-row-reverse space-x-reverse"
    )}>
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
        isUser ? "bg-gray-400" : "bg-blue-500"
      )}>
        {isUser ? (
          <User className="h-4 w-4 text-white" />
        ) : (
          <Bot className="h-4 w-4 text-white" />
        )}
      </div>
      
      <div className="flex-1">
        <div className={cn(
          "rounded-lg p-4",
          isUser 
            ? "bg-blue-500 text-white ml-auto max-w-xs sm:max-w-md" 
            : "bg-white shadow-sm border border-gray-200"
        )}>
          <p className={cn(
            "whitespace-pre-wrap",
            isUser ? "text-white" : "text-gray-800"
          )}>
            {message.content}
          </p>
          
          {!isUser && (
            <div className="border-t border-gray-100 pt-3 mt-3">
              <p className="text-sm font-medium text-gray-700 mb-2">Was this helpful?</p>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFeedback("positive")}
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    feedbackGiven === "positive" 
                      ? "text-green-600 bg-green-50" 
                      : "text-gray-400 hover:text-green-600 hover:bg-green-50"
                  )}
                  disabled={feedbackGiven !== null}
                >
                  <ThumbsUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFeedback("negative")}
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    feedbackGiven === "negative" 
                      ? "text-red-600 bg-red-50" 
                      : "text-gray-400 hover:text-red-600 hover:bg-red-50"
                  )}
                  disabled={feedbackGiven !== null}
                >
                  <ThumbsDown className="h-4 w-4" />
                </Button>
                <div className="text-xs text-gray-500 ml-2">
                  {feedbackGiven ? "Thanks for your feedback!" : "Help me improve"}
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className={cn(
          "text-xs text-gray-500 mt-1",
          isUser && "text-right"
        )}>
          {formatTimestamp(message.timestamp)}
        </div>
      </div>
    </div>
  );
}
