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
    const rawHistory = [...messages, userMessage];
    // Remove previous generic error messages from context and cap history size
    const cleanedHistory = rawHistory
      .filter(m => !(m.role === "assistant" && m.content.includes("Sorry, I hit an error")))
      .slice(-20);

    setMessages(rawHistory);
    setInput("");

    // Assistant placeholder for streaming tokens
    setMessages(prev => [...prev, { role: "assistant", content: "" }]);

    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-assistant-chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Public function, auth optional. Add header if needed:
          // Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: cleanedHistory }),
      });

      if (resp.status === 402 || resp.status === 429) {
        let data: any = {};
        try { data = await resp.json(); } catch {}
        const msg = data?.error ?? (resp.status === 402
          ? "Payment required, please add credits to your workspace."
          : "Rate limits exceeded, please try again later.");
        setMessages(prev => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: "assistant", content: msg };
          return copy;
        });
        return;
      }
      if (!resp.ok || !resp.body) throw new Error(`Failed to start stream (${resp.status})`);

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let assistantSoFar = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue; // comments/keepalive
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (delta) {
              assistantSoFar += delta;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  const copy = [...prev];
                  copy[copy.length - 1] = { ...last, content: assistantSoFar };
                  return copy;
                }
                return [...prev, { role: "assistant", content: assistantSoFar }];
              });
            }
          } catch {
            // Incomplete JSON, push back and wait for more
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Flush leftover lines if any
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (delta) {
              assistantSoFar += delta;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  const copy = [...prev];
                  copy[copy.length - 1] = { ...last, content: assistantSoFar };
                  return copy;
                }
                return [...prev, { role: "assistant", content: assistantSoFar }];
              });
            }
          } catch { /* ignore leftovers */ }
        }
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => {
        const copy = [...prev];
        copy[copy.length - 1] = { role: "assistant", content: "Sorry, I hit an error. Please try again." };
        return copy;
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
