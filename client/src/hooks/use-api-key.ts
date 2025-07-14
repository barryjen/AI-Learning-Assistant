import { useState, useEffect } from "react";

export function useApiKey() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if API key exists in localStorage
    const savedKey = localStorage.getItem("gemini-api-key");
    if (savedKey) {
      setApiKey(savedKey);
    }
    setIsLoading(false);
  }, []);

  const saveApiKey = (key: string) => {
    localStorage.setItem("gemini-api-key", key);
    setApiKey(key);
  };

  const clearApiKey = () => {
    localStorage.removeItem("gemini-api-key");
    setApiKey(null);
  };

  return {
    apiKey,
    isLoading,
    hasApiKey: !!apiKey,
    saveApiKey,
    clearApiKey,
  };
}