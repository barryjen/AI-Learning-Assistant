import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  BookOpen, 
  Lightbulb, 
  Code, 
  Search, 
  MessageSquare,
  Brain,
  Zap,
  Target
} from "lucide-react";

const AI_MODES = [
  { 
    id: "general", 
    name: "General Assistant", 
    icon: MessageSquare, 
    color: "bg-blue-500",
    description: "Balanced responses for any topic"
  },
  { 
    id: "tutor", 
    name: "Learning Tutor", 
    icon: BookOpen, 
    color: "bg-green-500",
    description: "Educational explanations and step-by-step guidance"
  },
  { 
    id: "creative", 
    name: "Creative Helper", 
    icon: Lightbulb, 
    color: "bg-purple-500",
    description: "Imaginative and artistic responses"
  },
  { 
    id: "code", 
    name: "Code Assistant", 
    icon: Code, 
    color: "bg-orange-500",
    description: "Programming help and technical solutions"
  },
  { 
    id: "research", 
    name: "Research Helper", 
    icon: Search, 
    color: "bg-teal-500",
    description: "Analytical and fact-based responses"
  }
];

const AI_MODELS = [
  { id: "gemini", name: "Gemini 2.5 Flash", icon: Brain, description: "Google's fast and efficient model" },
  { id: "gemini-pro", name: "Gemini 2.5 Pro", icon: Zap, description: "Google's most capable model" },
  { id: "gemini-thinking", name: "Gemini 2.0 Thinking", icon: Target, description: "Google's reasoning model" }
];

interface ModeSelectorProps {
  currentMode: string;
  currentModel: string;
  onModeChange: (mode: string) => void;
  onModelChange: (model: string) => void;
  isLearning?: boolean;
}

export function ModeSelector({ 
  currentMode, 
  currentModel, 
  onModeChange, 
  onModelChange, 
  isLearning 
}: ModeSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const selectedMode = AI_MODES.find(mode => mode.id === currentMode) || AI_MODES[0];
  const selectedModel = AI_MODELS.find(model => model.id === currentModel) || AI_MODELS[0];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2"
        >
          <selectedMode.icon className="h-4 w-4" />
          {selectedMode.name}
          {isLearning && <Badge variant="secondary" className="ml-2">Learning</Badge>}
        </Button>
        
        <Select value={currentModel} onValueChange={onModelChange}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {AI_MODELS.map((model) => (
              <SelectItem key={model.id} value={model.id}>
                <div className="flex items-center gap-2">
                  <model.icon className="h-4 w-4" />
                  <div>
                    <div className="font-medium">{model.name}</div>
                    <div className="text-xs text-muted-foreground">{model.description}</div>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {AI_MODES.map((mode) => {
            const isSelected = mode.id === currentMode;
            return (
              <Button
                key={mode.id}
                variant={isSelected ? "default" : "outline"}
                className={`p-4 h-auto text-left justify-start ${
                  isSelected ? "ring-2 ring-blue-500" : ""
                }`}
                onClick={() => {
                  onModeChange(mode.id);
                  setIsExpanded(false);
                }}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${mode.color} text-white`}>
                    <mode.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{mode.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {mode.description}
                    </div>
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
}