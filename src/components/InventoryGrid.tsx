import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react";

const inventoryItems = [
  { name: "Amul Milk 1L", category: "Dairy", stock: 124, status: "healthy", demand: "high", price: "₹62" },
  { name: "Lays Classic 52g", category: "Snacks", stock: 8, status: "low", demand: "high", price: "₹20" },
  { name: "Coca Cola 750ml", category: "Beverages", stock: 245, status: "healthy", demand: "medium", price: "₹40" },
  { name: "Britannia Bread", category: "Bakery", stock: 32, status: "expiring", demand: "high", price: "₹35" },
  { name: "Tata Salt 1kg", category: "Grocery", stock: 156, status: "healthy", demand: "low", price: "₹25" },
  { name: "Red Bull 250ml", category: "Beverages", stock: 5, status: "critical", demand: "medium", price: "₹125" },
  { name: "Parle-G 376g", category: "Snacks", stock: 89, status: "healthy", demand: "high", price: "₹45" },
  { name: "Haldiram Bhujia", category: "Snacks", stock: 15, status: "low", demand: "high", price: "₹55" },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "healthy": return "bg-success/20 text-success border-success/30";
    case "low": return "bg-warning/20 text-warning border-warning/30";
    case "critical": return "bg-destructive/20 text-destructive border-destructive/30";
    case "expiring": return "bg-warning/20 text-warning border-warning/30";
    default: return "bg-muted text-muted-foreground";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "healthy": return <CheckCircle2 className="w-3 h-3" />;
    case "low": return <AlertTriangle className="w-3 h-3" />;
    case "critical": return <AlertTriangle className="w-3 h-3" />;
    case "expiring": return <AlertTriangle className="w-3 h-3" />;
    default: return null;
  }
};

const InventoryGrid = () => {
  return (
    <Card className="p-6 bg-card border-border">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            Live Inventory Status
          </h3>
          <p className="text-sm text-muted-foreground">Real-time stock tracking across all SKUs</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {inventoryItems.map((item, index) => (
          <div 
            key={index}
            className="p-4 rounded-lg border border-border bg-secondary/30 hover:bg-secondary/50 transition-colors"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <h4 className="font-semibold text-foreground text-sm">{item.name}</h4>
                <p className="text-xs text-muted-foreground">{item.category}</p>
              </div>
              <Badge className={getStatusColor(item.status)}>
                {getStatusIcon(item.status)}
                <span className="ml-1 capitalize">{item.status}</span>
              </Badge>
            </div>
            
            <div className="flex justify-between items-center mt-3">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Stock</p>
                  <p className="text-sm font-bold text-foreground">{item.stock} units</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Demand</p>
                  <div className="flex items-center gap-1">
                    {item.demand === "high" && <TrendingUp className="w-3 h-3 text-success" />}
                    <p className="text-sm font-semibold text-foreground capitalize">{item.demand}</p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Price</p>
                <p className="text-sm font-bold text-primary">{item.price}</p>
              </div>
            </div>

            {item.status === "low" || item.status === "critical" ? (
              <div className="mt-3 p-2 bg-warning/10 rounded border border-warning/30">
                <p className="text-xs text-warning">
                  AI Recommendation: Restock {item.status === "critical" ? "immediately" : "within 24 hours"}
                </p>
              </div>
            ) : item.status === "expiring" ? (
              <div className="mt-3 p-2 bg-warning/10 rounded border border-warning/30">
                <p className="text-xs text-warning">
                  Expiring in 3 days - Consider promotion
                </p>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </Card>
  );
};

export default InventoryGrid;
