import { useState, useEffect } from "react";

export function useApiKey() {
  const [geminiApiKey, setGeminiApiKey] = useState<string | null>(null);
  const [openaiApiKey, setOpenaiApiKey] = useState<string | null>(null);
  const [preferredProvider, setPreferredProvider] = useState<string>("gemini");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if API keys exist in localStorage
    const savedGeminiKey = localStorage.getItem("gemini-api-key");
    const savedOpenaiKey = localStorage.getItem("openai-api-key");
    const savedProvider = localStorage.getItem("preferred-provider") || "gemini";
    
    if (savedGeminiKey) {
      setGeminiApiKey(savedGeminiKey);
    }
    if (savedOpenaiKey) {
      setOpenaiApiKey(savedOpenaiKey);
    }
    setPreferredProvider(savedProvider);
    setIsLoading(false);
  }, []);

  const saveApiKey = (key: string, provider: string) => {
    localStorage.setItem(`${provider}-api-key`, key);
    localStorage.setItem("preferred-provider", provider);
    
    if (provider === "gemini") {
      setGeminiApiKey(key);
    } else if (provider === "openai") {
      setOpenaiApiKey(key);
    }
    setPreferredProvider(provider);
  };

  const clearApiKey = (provider?: string) => {
    if (provider) {
      localStorage.removeItem(`${provider}-api-key`);
      if (provider === "gemini") {
        setGeminiApiKey(null);
      } else if (provider === "openai") {
        setOpenaiApiKey(null);
      }
    } else {
      // Clear all keys
      localStorage.removeItem("gemini-api-key");
      localStorage.removeItem("openai-api-key");
      localStorage.removeItem("preferred-provider");
      setGeminiApiKey(null);
      setOpenaiApiKey(null);
      setPreferredProvider("gemini");
    }
  };

  const getCurrentApiKey = (provider?: string) => {
    const currentProvider = provider || preferredProvider;
    return currentProvider === "gemini" ? geminiApiKey : openaiApiKey;
  };

  const hasApiKey = (provider?: string) => {
    const currentProvider = provider || preferredProvider;
    return currentProvider === "gemini" ? !!geminiApiKey : !!openaiApiKey;
  };

  const hasAnyApiKey = () => {
    return !!geminiApiKey || !!openaiApiKey;
  };

  return {
    geminiApiKey,
    openaiApiKey,
    preferredProvider,
    isLoading,
    hasApiKey,
    hasAnyApiKey,
    getCurrentApiKey,
    saveApiKey,
    clearApiKey,
    setPreferredProvider: (provider: string) => {
      localStorage.setItem("preferred-provider", provider);
      setPreferredProvider(provider);
    }
  };
}