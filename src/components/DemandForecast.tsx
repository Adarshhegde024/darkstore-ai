import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Brain } from "lucide-react";

const DemandForecast = () => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const forecastData = [
    { day: "Mon", orders: 420, confidence: 92 },
    { day: "Tue", orders: 385, confidence: 89 },
    { day: "Wed", orders: 450, confidence: 91 },
    { day: "Thu", orders: 480, confidence: 88 },
    { day: "Fri", orders: 550, confidence: 94 },
    { day: "Sat", orders: 720, confidence: 95 },
    { day: "Sun", orders: 680, confidence: 93 },
  ];

  const maxOrders = Math.max(...forecastData.map(d => d.orders));

  return (
    <Card className="p-6 bg-card border-border">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            AI Demand Forecast
          </h3>
          <p className="text-sm text-muted-foreground">7-day predictive analysis</p>
        </div>
        <Badge className="bg-primary/20 text-primary border-primary/30">
          <TrendingUp className="w-3 h-3 mr-1" />
          91% avg confidence
        </Badge>
      </div>

      <div className="space-y-4">
        {forecastData.map((item, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium text-foreground">{item.day}</span>
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground">{item.orders} orders</span>
                <span className="text-xs text-primary font-semibold">{item.confidence}%</span>
              </div>
            </div>
            <div className="relative h-8 bg-secondary/30 rounded-full overflow-hidden">
              <div 
                className="absolute inset-y-0 left-0 bg-gradient-ai rounded-full transition-all duration-500 shadow-glow-ai"
                style={{ width: `${(item.orders / maxOrders) * 100}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-primary/20 animate-pulse"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-primary/10 rounded-lg border border-primary/30">
        <div className="flex items-start gap-3">
          <Brain className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-foreground mb-1">AI Prediction</p>
            <p className="text-xs text-muted-foreground">
              Weekend spike expected (+32% vs weekday avg). Top categories: Snacks, Beverages, Dairy. 
              Recommend pre-stocking fast-moving items by Friday 2 PM.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default DemandForecast;
