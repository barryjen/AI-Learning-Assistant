import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { Menu, Bot, Settings, ChevronDown } from "lucide-react";

interface ChatHeaderProps {
  isLearning: boolean;
  onToggleSidebar: () => void;
  currentModel: string;
  onModelChange: (model: string) => void;
  availableModels: string[];
  hasGeminiKey: boolean;
  hasOpenAIKey: boolean;
}

export function ChatHeader({ 
  isLearning, 
  onToggleSidebar, 
  currentModel, 
  onModelChange, 
  availableModels, 
  hasGeminiKey, 
  hasOpenAIKey 
}: ChatHeaderProps) {
  const getModelDisplayName = (model: string) => {
    switch (model) {
      case "gemini":
        return "Gemini 2.5 Flash";
      case "gpt-4o":
        return "GPT-4o";
      case "openai":
        return "OpenAI";
      default:
        return model;
    }
  };

  const getModelBadgeColor = (model: string) => {
    if (model === "gemini") return "bg-blue-500";
    if (model === "gpt-4o" || model === "openai") return "bg-green-500";
    return "bg-gray-500";
  };

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleSidebar}
          className="lg:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
        >
          <Menu className="h-4 w-4" />
        </Button>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100">AI Learning Assistant</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Getting smarter with every conversation</p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        {isLearning && (
          <div className="flex items-center space-x-2 text-xs text-green-600 dark:text-green-400">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Learning from feedback...</span>
          </div>
        )}
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center space-x-2 text-sm"
            >
              <Badge className={`${getModelBadgeColor(currentModel)} text-white`}>
                {getModelDisplayName(currentModel)}
              </Badge>
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {hasGeminiKey && (
              <DropdownMenuItem onClick={() => onModelChange("gemini")}>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Gemini 2.5 Flash</span>
                </div>
              </DropdownMenuItem>
            )}
            {hasOpenAIKey && (
              <DropdownMenuItem onClick={() => onModelChange("gpt-4o")}>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>GPT-4o</span>
                </div>
              </DropdownMenuItem>
            )}
            {(!hasGeminiKey || !hasOpenAIKey) && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-gray-500 text-xs">
                  Add more API keys in settings
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Button
          variant="ghost"
          size="sm"
          className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
