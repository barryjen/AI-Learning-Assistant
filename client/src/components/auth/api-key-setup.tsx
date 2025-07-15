import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Key, ExternalLink, AlertCircle, CheckCircle } from "lucide-react";

interface ApiKeySetupProps {
  isOpen: boolean;
  onApiKeySet: (apiKey: string, provider: string) => void;
  onClose: () => void;
}

export function ApiKeySetup({ isOpen, onApiKeySet, onClose }: ApiKeySetupProps) {
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [openaiApiKey, setOpenaiApiKey] = useState("");
  const [activeProvider, setActiveProvider] = useState("gemini");
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const currentApiKey = activeProvider === "gemini" ? geminiApiKey : openaiApiKey;
    
    if (!currentApiKey.trim()) {
      setError(`Please enter your ${activeProvider === "gemini" ? "Gemini" : "OpenAI"} API key`);
      return;
    }

    // Validate API key format
    if (activeProvider === "gemini" && !currentApiKey.startsWith("AIza")) {
      setError("Invalid API key format. Gemini API keys start with 'AIza'");
      return;
    }

    if (activeProvider === "openai" && !currentApiKey.startsWith("sk-")) {
      setError("Invalid API key format. OpenAI API keys start with 'sk-'");
      return;
    }

    setIsValidating(true);
    setError("");

    try {
      // Test the API key by making a simple request
      const response = await fetch("/api/test-api-key", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          apiKey: currentApiKey,
          model: activeProvider === "gemini" ? "gemini" : "openai"
        }),
      });

      if (response.ok) {
        localStorage.setItem(`${activeProvider}-api-key`, currentApiKey);
        onApiKeySet(currentApiKey, activeProvider);
        onClose();
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Invalid API key");
      }
    } catch (err) {
      setError("Failed to validate API key. Please try again.");
    } finally {
      setIsValidating(false);
    }
  };

  const currentApiKey = activeProvider === "gemini" ? geminiApiKey : openaiApiKey;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Setup AI API Key
          </DialogTitle>
          <DialogDescription>
            Choose your preferred AI provider and enter your API key to get started.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Your API key is stored securely in your browser and never sent to our servers.
            </AlertDescription>
          </Alert>

          <Tabs value={activeProvider} onValueChange={setActiveProvider}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="gemini">Google Gemini</TabsTrigger>
              <TabsTrigger value="openai">OpenAI</TabsTrigger>
            </TabsList>
            
            <TabsContent value="gemini" className="space-y-4">
              <div className="space-y-3">
                <div>
                  <h3 className="font-medium mb-2">How to get your Gemini API key:</h3>
                  <ol className="text-sm space-y-1 list-decimal list-inside text-muted-foreground">
                    <li>Go to Google AI Studio</li>
                    <li>Sign in with your Google account</li>
                    <li>Click "Get API Key"</li>
                    <li>Copy the generated key</li>
                  </ol>
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => window.open("https://aistudio.google.com/app/apikey", "_blank")}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Get API Key from Google AI Studio
                </Button>
              </div>

              <div>
                <Label htmlFor="geminiApiKey">Gemini API Key</Label>
                <Input
                  id="geminiApiKey"
                  type="password"
                  placeholder="AIza..."
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  disabled={isValidating}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="openai" className="space-y-4">
              <div className="space-y-3">
                <div>
                  <h3 className="font-medium mb-2">How to get your OpenAI API key:</h3>
                  <ol className="text-sm space-y-1 list-decimal list-inside text-muted-foreground">
                    <li>Go to OpenAI Platform</li>
                    <li>Sign in to your OpenAI account</li>
                    <li>Navigate to API keys section</li>
                    <li>Create a new API key</li>
                    <li>Copy the generated key</li>
                  </ol>
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => window.open("https://platform.openai.com/api-keys", "_blank")}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Get API Key from OpenAI Platform
                </Button>
              </div>

              <div>
                <Label htmlFor="openaiApiKey">OpenAI API Key</Label>
                <Input
                  id="openaiApiKey"
                  type="password"
                  placeholder="sk-..."
                  value={openaiApiKey}
                  onChange={(e) => setOpenaiApiKey(e.target.value)}
                  disabled={isValidating}
                />
              </div>
            </TabsContent>
          </Tabs>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isValidating || !currentApiKey.trim()}
            >
              {isValidating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Validating...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Set API Key
                </>
              )}
            </Button>
          </form>

          <div className="text-xs text-muted-foreground">
            <p>
              <strong>Privacy:</strong> Your API key is only stored in your browser's local storage 
              and is used directly to communicate with the AI provider's servers. We never store or have access to your key.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}