import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  TrendingUp, 
  MessageSquare, 
  ThumbsUp, 
  Target,
  BookOpen,
  Zap,
  BarChart3
} from "lucide-react";

interface LearningStats {
  totalConversations: number;
  positiveRating: number;
  totalFeedback: number;
  topicKeywords: string[];
  preferredModes: string[];
  learningStyle: string;
  isLearning: boolean;
}

interface LearningProgressProps {
  stats: LearningStats;
  isLoading?: boolean;
}

export function LearningProgress({ stats, isLoading }: LearningProgressProps) {
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 animate-pulse" />
            Learning Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 bg-muted rounded animate-pulse" />
            <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
            <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const progressPercentage = Math.min((stats.totalConversations / 10) * 100, 100);
  const ratingPercentage = (stats.positiveRating / 5) * 100;

  const getModeColor = (mode: string) => {
    switch (mode) {
      case "tutor": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "creative": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "code": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "research": return "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200";
      default: return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    }
  };

  const getStyleIcon = (style: string) => {
    switch (style) {
      case "visual": return BookOpen;
      case "analytical": return BarChart3;
      case "creative": return Zap;
      default: return Target;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Learning Progress
          {stats.isLearning && (
            <Badge variant="secondary" className="ml-2">
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                Active
              </div>
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-muted-foreground">
              {stats.totalConversations}/10 conversations
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-blue-500" />
            <div>
              <div className="text-sm font-medium">{stats.totalConversations}</div>
              <div className="text-xs text-muted-foreground">Conversations</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <ThumbsUp className="h-4 w-4 text-green-500" />
            <div>
              <div className="text-sm font-medium">{stats.totalFeedback}</div>
              <div className="text-xs text-muted-foreground">Feedback</div>
            </div>
          </div>
        </div>

        {/* Rating */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              Response Quality
            </span>
            <span className="text-sm text-muted-foreground">
              {stats.positiveRating.toFixed(1)}/5.0
            </span>
          </div>
          <Progress value={ratingPercentage} className="h-2" />
        </div>

        {/* Learning Style */}
        {stats.learningStyle && (
          <div className="flex items-center gap-2">
            {(() => {
              const StyleIcon = getStyleIcon(stats.learningStyle);
              return <StyleIcon className="h-4 w-4 text-purple-500" />;
            })()}
            <div>
              <div className="text-sm font-medium">Learning Style</div>
              <div className="text-xs text-muted-foreground capitalize">
                {stats.learningStyle}
              </div>
            </div>
          </div>
        )}

        {/* Preferred Modes */}
        {stats.preferredModes.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium">Preferred Modes</div>
            <div className="flex flex-wrap gap-1">
              {stats.preferredModes.slice(0, 3).map((mode, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className={`text-xs ${getModeColor(mode)}`}
                >
                  {mode}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Topic Keywords */}
        {stats.topicKeywords.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium">Recent Topics</div>
            <div className="flex flex-wrap gap-1">
              {stats.topicKeywords.slice(0, 5).map((keyword, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {keyword}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Help Text */}
        <div className="text-xs text-muted-foreground mt-4 p-3 bg-muted/50 rounded-lg">
          <p className="font-medium mb-1">How it works:</p>
          <p>
            The AI learns from your conversations and feedback to provide better responses over time. 
            Use the thumbs up/down buttons to help improve future responses.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}