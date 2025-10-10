import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X, Send, Sparkles } from "lucide-react";
import aiAssistant from "@/assets/ai-assistant.png";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AIAssistantProps {
  onClose: () => void;
}

const AIAssistant = ({ onClose }: AIAssistantProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm your AI Store Assistant. Ask me anything about your inventory, demand forecasts, or stock optimization. Try: 'What's running low today?' or 'Show me top sellers this week'."
    }
  ]);
  const [input, setInput] = useState("");

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");

    // Add a placeholder message for the assistant
    const assistantPlaceholder: Message = { role: "assistant", content: "" };
    setMessages(prev => [...prev, assistantPlaceholder]);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-assistant-chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: newMessages,
            prompt: input
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantResponse = "";

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                assistantResponse += parsed.text;
                setMessages(prev => {
                  const newMsgs = [...prev];
                  newMsgs[newMsgs.length - 1] = {
                    role: "assistant",
                    content: assistantResponse
                  };
                  return newMsgs;
                });
              }
            } catch (e) {
              console.error('Error parsing chunk:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => {
        const newMsgs = [...prev];
        newMsgs[newMsgs.length - 1] = {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again."
        };
        return newMsgs;
      });
    }
  };

  return (
    <Card className="p-4 bg-card border-border shadow-glow-ai fixed bottom-4 right-4 w-96 max-h-[600px] flex flex-col z-50">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
        <div className="flex items-center gap-3">
          <img src={aiAssistant} alt="AI Assistant" className="w-10 h-10 rounded-full shadow-glow-ai" />
          <div>
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              AI Assistant
              <Badge className="bg-success/20 text-success text-xs">Online</Badge>
            </h3>
            <p className="text-xs text-muted-foreground">Ask me anything</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onClose}
          className="hover:bg-destructive/20"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
        {messages.map((message, index) => (
          <div 
            key={index}
            className={`flex gap-3 ${message.role === "user" ? "justify-end" : ""}`}
          >
            {message.role === "assistant" && (
              <div className="w-8 h-8 rounded-full bg-gradient-ai flex items-center justify-center flex-shrink-0 shadow-glow-ai">
                <Sparkles className="w-4 h-4 text-primary-foreground" />
              </div>
            )}
            <div 
              className={`p-3 rounded-lg max-w-[80%] ${
                message.role === "user" 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-secondary text-foreground"
              }`}
            >
              <p className="text-sm">{message.content}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask about inventory, forecasts..."
          className="flex-1 bg-secondary border-border"
        />
        <Button 
          onClick={handleSend}
          className="bg-gradient-ai hover:opacity-90 shadow-glow-ai"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {["What's running low?", "Top sellers?", "Weekend forecast?"].map((suggestion, idx) => (
          <Button
            key={idx}
            variant="outline"
            size="sm"
            onClick={() => setInput(suggestion)}
            className="text-xs"
          >
            {suggestion}
          </Button>
        ))}
      </div>
    </Card>
  );
};

export default AIAssistant;
