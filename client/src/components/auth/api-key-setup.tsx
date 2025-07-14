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
import { Key, ExternalLink, AlertCircle, CheckCircle } from "lucide-react";

interface ApiKeySetupProps {
  isOpen: boolean;
  onApiKeySet: (apiKey: string) => void;
  onClose: () => void;
}

export function ApiKeySetup({ isOpen, onApiKeySet, onClose }: ApiKeySetupProps) {
  const [apiKey, setApiKey] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      setError("Please enter your Gemini API key");
      return;
    }

    if (!apiKey.startsWith("AIza")) {
      setError("Invalid API key format. Gemini API keys start with 'AIza'");
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
        body: JSON.stringify({ apiKey }),
      });

      if (response.ok) {
        localStorage.setItem("gemini-api-key", apiKey);
        onApiKeySet(apiKey);
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Setup Gemini API Key
          </DialogTitle>
          <DialogDescription>
            To use the AI Learning Assistant, you need to provide your own Google Gemini API key.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Your API key is stored securely in your browser and never sent to our servers.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <div>
              <h3 className="font-medium mb-2">How to get your API key:</h3>
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="apiKey">Gemini API Key</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="AIza..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                disabled={isValidating}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isValidating || !apiKey.trim()}
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
              and is used directly to communicate with Google's servers. We never store or have access to your key.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}