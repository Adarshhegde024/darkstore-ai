import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, Package, TrendingUp } from "lucide-react";

const alerts = [
  {
    type: "critical",
    icon: AlertTriangle,
    title: "Critical Stock Alert",
    message: "Red Bull 250ml down to 5 units",
    action: "Restock Now",
    time: "2 min ago"
  },
  {
    type: "warning",
    icon: Clock,
    title: "Expiry Warning",
    message: "32 units of Britannia Bread expire in 3 days",
    action: "View Details",
    time: "15 min ago"
  },
  {
    type: "low",
    icon: Package,
    title: "Low Stock",
    message: "8 SKUs below reorder threshold",
    action: "Generate Order",
    time: "1 hour ago"
  },
  {
    type: "insight",
    icon: TrendingUp,
    title: "Demand Spike Detected",
    message: "Haldiram Bhujia trending +45% today",
    action: "Adjust Stock",
    time: "2 hours ago"
  }
];

const getAlertStyle = (type: string) => {
  switch (type) {
    case "critical": return "border-destructive/50 bg-destructive/5";
    case "warning": return "border-warning/50 bg-warning/5";
    case "low": return "border-warning/30 bg-warning/5";
    case "insight": return "border-primary/30 bg-primary/5";
    default: return "";
  }
};

const getIconColor = (type: string) => {
  switch (type) {
    case "critical": return "text-destructive";
    case "warning": return "text-warning";
    case "low": return "text-warning";
    case "insight": return "text-primary";
    default: return "text-foreground";
  }
};

const QuickActions = () => {
  return (
    <Card className="p-6 bg-card border-border">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-warning" />
          Quick Actions
        </h3>
        <p className="text-sm text-muted-foreground">Alerts requiring attention</p>
      </div>

      <div className="space-y-3">
        {alerts.map((alert, index) => {
          const Icon = alert.icon;
          return (
            <div 
              key={index}
              className={`p-4 rounded-lg border transition-all hover:shadow-lg ${getAlertStyle(alert.type)}`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  alert.type === "critical" ? "bg-destructive/20" :
                  alert.type === "warning" ? "bg-warning/20" :
                  alert.type === "low" ? "bg-warning/20" :
                  "bg-primary/20"
                }`}>
                  <Icon className={`w-4 h-4 ${getIconColor(alert.type)}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <h4 className="font-semibold text-sm text-foreground">{alert.title}</h4>
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">{alert.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">{alert.message}</p>
                  <Button 
                    size="sm" 
                    variant={alert.type === "critical" ? "destructive" : "secondary"}
                    className="w-full"
                  >
                    {alert.action}
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <Button variant="outline" className="w-full">
          View All Alerts
        </Button>
      </div>
    </Card>
  );
};

export default QuickActions;
