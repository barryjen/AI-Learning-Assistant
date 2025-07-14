import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Settings, 
  Moon, 
  Sun, 
  Mic, 
  Bell, 
  Download, 
  Upload,
  Trash2,
  Shield,
  Zap
} from "lucide-react";
import { useTheme } from "@/components/providers/theme-provider";

interface UserPreferences {
  theme: string | null;
  defaultModel: string | null;
  voiceEnabled: boolean | null;
  autoSuggestions: boolean | null;
}

interface SettingsPanelProps {
  preferences: UserPreferences;
  onUpdatePreferences: (updates: Partial<UserPreferences>) => void;
  onExportData: () => void;
  onImportData: (data: any) => void;
  onClearData: () => void;
}

export function SettingsPanel({ 
  preferences, 
  onUpdatePreferences, 
  onExportData, 
  onImportData, 
  onClearData 
}: SettingsPanelProps) {
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const handlePreferenceChange = (key: keyof UserPreferences, value: any) => {
    onUpdatePreferences({ [key]: value });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Settings & Preferences
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Appearance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="theme-toggle">Dark Mode</Label>
                <Switch
                  id="theme-toggle"
                  checked={theme === "dark"}
                  onCheckedChange={toggleTheme}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Default Theme</Label>
                <Select
                  value={preferences.theme || "light"}
                  onValueChange={(value) => handlePreferenceChange("theme", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* AI Model Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Zap className="h-4 w-4" />
                AI Model Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Default Model</Label>
                <Select
                  value={preferences.defaultModel || "gemini"}
                  onValueChange={(value) => handlePreferenceChange("defaultModel", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gemini">Gemini 2.5 Flash</SelectItem>
                    <SelectItem value="gemini-pro">Gemini 2.5 Pro</SelectItem>
                    <SelectItem value="gemini-thinking">Gemini 2.0 Thinking</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="auto-suggestions">Auto Suggestions</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically generate suggested follow-up questions
                  </p>
                </div>
                <Switch
                  id="auto-suggestions"
                  checked={preferences.autoSuggestions ?? true}
                  onCheckedChange={(checked) => handlePreferenceChange("autoSuggestions", checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Voice & Accessibility */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Mic className="h-4 w-4" />
                Voice & Accessibility
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="voice-enabled">Voice Input</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable voice-to-text input for messages
                  </p>
                </div>
                <Switch
                  id="voice-enabled"
                  checked={preferences.voiceEnabled ?? false}
                  onCheckedChange={(checked) => handlePreferenceChange("voiceEnabled", checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="notifications">Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable browser notifications for responses
                  </p>
                </div>
                <Switch
                  id="notifications"
                  checked={false}
                  onCheckedChange={() => {}}
                />
              </div>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="h-4 w-4" />
                Data Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={onExportData}
                >
                  <Download className="h-4 w-4" />
                  Export Data
                </Button>
                
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={() => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = ".json";
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                          try {
                            const data = JSON.parse(e.target?.result as string);
                            onImportData(data);
                          } catch (error) {
                            console.error("Invalid JSON file");
                          }
                        };
                        reader.readAsText(file);
                      }
                    };
                    input.click();
                  }}
                >
                  <Upload className="h-4 w-4" />
                  Import Data
                </Button>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label className="text-destructive">Danger Zone</Label>
                <Button
                  variant="destructive"
                  className="w-full flex items-center gap-2"
                  onClick={onClearData}
                >
                  <Trash2 className="h-4 w-4" />
                  Clear All Data
                </Button>
                <p className="text-xs text-muted-foreground">
                  This will permanently delete all conversations, messages, and learning data.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* About */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">About</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p><strong>AI Learning Assistant</strong> v1.0.0</p>
                <p>Powered by Google Gemini AI</p>
                <p>Built with React, TypeScript, and Tailwind CSS</p>
                <p className="text-muted-foreground">
                  This assistant learns from your interactions to provide better responses over time.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}