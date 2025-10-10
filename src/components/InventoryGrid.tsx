import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Product {
  id: string;
  name: string;
  category: string;
  stock: number;
  reorder_threshold: number;
  price: number;
  expiry_date: string | null;
  demand_level: string;
}

const getStatus = (product: Product) => {
  if (product.stock <= 5) return 'critical';
  if (product.stock < product.reorder_threshold) return 'low';
  if (product.expiry_date) {
    const daysUntilExpiry = Math.ceil((new Date(product.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (daysUntilExpiry <= 7) return 'expiring';
  }
  return 'healthy';
};

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
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchProducts();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('products-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        fetchProducts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('name');
    
    if (data) setProducts(data);
  };

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
        {products.map((item) => {
          const status = getStatus(item);
          return (
            <div 
              key={item.id}
              className="p-4 rounded-lg border border-border bg-secondary/30 hover:bg-secondary/50 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground text-sm">{item.name}</h4>
                  <p className="text-xs text-muted-foreground">{item.category}</p>
                </div>
                <Badge className={getStatusColor(status)}>
                  {getStatusIcon(status)}
                  <span className="ml-1 capitalize">{status}</span>
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
                      {item.demand_level === "high" && <TrendingUp className="w-3 h-3 text-success" />}
                      <p className="text-sm font-semibold text-foreground capitalize">{item.demand_level}</p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Price</p>
                  <p className="text-sm font-bold text-primary">₹{item.price}</p>
                </div>
              </div>

              {status === "low" || status === "critical" ? (
                <div className="mt-3 p-2 bg-warning/10 rounded border border-warning/30">
                  <p className="text-xs text-warning">
                    AI Recommendation: Restock {status === "critical" ? "immediately" : "within 24 hours"}
                  </p>
                </div>
              ) : status === "expiring" ? (
                <div className="mt-3 p-2 bg-warning/10 rounded border border-warning/30">
                  <p className="text-xs text-warning">
                    Expiring soon - Consider promotion
                  </p>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default InventoryGrid;
