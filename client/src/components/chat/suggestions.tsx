import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, MessageSquare, ArrowRight, Sparkles } from "lucide-react";

interface Suggestion {
  id: number;
  type: string;
  content: string;
  priority: number | null;
  used: boolean | null;
  conversationId: number;
  createdAt: Date;
}

interface SuggestionsProps {
  suggestions: Suggestion[];
  onSuggestionClick: (content: string, suggestionId: number) => void;
  isLoading?: boolean;
  mode?: string;
}

export function Suggestions({ 
  suggestions, 
  onSuggestionClick, 
  isLoading,
  mode = "general"
}: SuggestionsProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4 animate-pulse" />
          Generating suggestions...
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-3 animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-2" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!suggestions.length) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No suggestions available yet</p>
        <p className="text-xs">Start a conversation to get personalized suggestions</p>
      </div>
    );
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "follow-up": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "related": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "clarification": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "deep-dive": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "follow-up": return "Follow-up";
      case "related": return "Related";
      case "clarification": return "Clarify";
      case "deep-dive": return "Deep Dive";
      default: return type;
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Lightbulb className="h-4 w-4" />
        Suggested questions based on your conversation
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {suggestions.map((suggestion) => (
          <Card 
            key={suggestion.id} 
            className="p-3 hover:shadow-md transition-shadow cursor-pointer group"
            onClick={() => onSuggestionClick(suggestion.content, suggestion.id)}
          >
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${getTypeColor(suggestion.type)}`}
                  >
                    {getTypeLabel(suggestion.type)}
                  </Badge>
                  {suggestion.priority && suggestion.priority <= 3 && (
                    <Badge variant="outline" className="text-xs">
                      Priority
                    </Badge>
                  )}
                </div>
                
                <p className="text-sm font-medium text-foreground mb-1">
                  {suggestion.content}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {mode} mode
                  </span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
      
      {suggestions.length > 6 && (
        <div className="text-center">
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            Show more suggestions
          </Button>
        </div>
      )}
    </div>
  );
}