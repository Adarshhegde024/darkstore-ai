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

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages([...messages, userMessage]);

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "Based on current trends, Lays Classic 52g and Red Bull 250ml need immediate restocking. They're at critical levels with high demand.",
        "Your top sellers this week are: 1) Amul Milk 1L (245 units), 2) Parle-G (189 units), 3) Coca Cola 750ml (167 units). All showing healthy stock levels.",
        "AI Analysis: Weekend demand is predicted to spike by 32%. I recommend increasing stock for Snacks (+40%), Beverages (+25%), and Dairy (+15%) categories by Friday.",
        "Currently, 7 items need attention: 6 are running low, and 1 (Britannia Bread) is expiring in 3 days. Would you like me to generate a restock order?",
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      const aiMessage: Message = { role: "assistant", content: randomResponse };
      setMessages(prev => [...prev, aiMessage]);
    }, 1000);

    setInput("");
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
