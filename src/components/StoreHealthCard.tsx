import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp } from "lucide-react";

const StoreHealthCard = () => {
  return (
    <Card className="p-6 bg-gradient-ai border-primary/30 shadow-glow-ai">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
            <h3 className="text-lg font-semibold text-primary-foreground">AI Store Health Summary</h3>
          </div>
          <Badge className="bg-success text-success-foreground">Excellent</Badge>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-primary-foreground">94/100</p>
          <p className="text-xs text-primary-foreground/80 flex items-center gap-1 justify-end mt-1">
            <TrendingUp className="w-3 h-3" />
            +8 points this week
          </p>
        </div>
      </div>
      
      <div className="space-y-3 bg-background/10 rounded-lg p-4 backdrop-blur-sm">
        <div className="flex justify-between text-sm">
          <span className="text-primary-foreground/90">Inventory Optimization</span>
          <span className="font-semibold text-primary-foreground">96%</span>
        </div>
        <div className="w-full bg-background/30 rounded-full h-2">
          <div className="bg-success rounded-full h-2" style={{ width: '96%' }}></div>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-primary-foreground/90">Demand Prediction Accuracy</span>
          <span className="font-semibold text-primary-foreground">92%</span>
        </div>
        <div className="w-full bg-background/30 rounded-full h-2">
          <div className="bg-success rounded-full h-2" style={{ width: '92%' }}></div>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-primary-foreground/90">Stock Freshness Score</span>
          <span className="font-semibold text-primary-foreground">94%</span>
        </div>
        <div className="w-full bg-background/30 rounded-full h-2">
          <div className="bg-success rounded-full h-2" style={{ width: '94%' }}></div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-background/20 rounded-lg border border-primary-foreground/10">
        <p className="text-sm text-primary-foreground/90">
          <span className="font-semibold">AI Insight:</span> Snacks category sales grew by 15% this week. 
          Consider increasing shelf space allocation by 10% to meet projected weekend demand.
        </p>
      </div>
    </Card>
  );
};

export default StoreHealthCard;
