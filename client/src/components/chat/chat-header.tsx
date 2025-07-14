import { Button } from "@/components/ui/button";
import { Menu, Bot, Settings } from "lucide-react";

interface ChatHeaderProps {
  isLearning: boolean;
  onToggleSidebar: () => void;
}

export function ChatHeader({ isLearning, onToggleSidebar }: ChatHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleSidebar}
          className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
        >
          <Menu className="h-4 w-4" />
        </Button>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-800">AI Learning Assistant</h1>
            <p className="text-xs text-gray-500">Getting smarter with every conversation</p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        {isLearning && (
          <div className="flex items-center space-x-2 text-xs text-green-600">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Learning from feedback...</span>
          </div>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
