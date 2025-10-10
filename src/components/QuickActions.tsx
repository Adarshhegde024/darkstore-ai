import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, Package, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { RestockDialog } from "./dialogs/RestockDialog";
import { ProductDetailsDialog } from "./dialogs/ProductDetailsDialog";
import { GenerateOrderDialog } from "./dialogs/GenerateOrderDialog";
import { AdjustStockDialog } from "./dialogs/AdjustStockDialog";
import { AllAlertsDialog } from "./dialogs/AllAlertsDialog";

interface Alert {
  id: string;
  type: string;
  title: string;
  message: string;
  product_id: string | null;
  action_type: string;
  created_at: string;
  products?: {
    id: string;
    name: string;
    stock: number;
  };
}

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
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [restockDialog, setRestockDialog] = useState<{ open: boolean; productId?: string; productName?: string; currentStock?: number }>({ open: false });
  const [detailsDialog, setDetailsDialog] = useState<{ open: boolean; product?: any }>({ open: false });
  const [generateOrderDialog, setGenerateOrderDialog] = useState(false);
  const [adjustStockDialog, setAdjustStockDialog] = useState<{ open: boolean; productId?: string; productName?: string; currentStock?: number }>({ open: false });
  const [allAlertsDialog, setAllAlertsDialog] = useState(false);

  useEffect(() => {
    fetchAlerts();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('alerts-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'alerts' }, () => {
        fetchAlerts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchAlerts = async () => {
    const { data } = await supabase
      .from('alerts')
      .select('*, products(id, name, stock)')
      .eq('is_resolved', false)
      .order('created_at', { ascending: false })
      .limit(4);
    
    if (data) setAlerts(data);
  };

  const handleAction = async (alert: Alert) => {
    switch (alert.action_type) {
      case 'restock':
        setRestockDialog({
          open: true,
          productId: alert.product_id || undefined,
          productName: alert.products?.name,
          currentStock: alert.products?.stock
        });
        break;
      case 'view_details':
        if (alert.product_id) {
          const { data } = await supabase
            .from('products')
            .select('*')
            .eq('id', alert.product_id)
            .single();
          if (data) setDetailsDialog({ open: true, product: data });
        }
        break;
      case 'generate_order':
        setGenerateOrderDialog(true);
        break;
      case 'adjust_stock':
        setAdjustStockDialog({
          open: true,
          productId: alert.product_id || undefined,
          productName: alert.products?.name,
          currentStock: alert.products?.stock
        });
        break;
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'critical': return AlertTriangle;
      case 'warning': return Clock;
      case 'low': return Package;
      case 'insight': return TrendingUp;
      default: return AlertTriangle;
    }
  };

  const getActionLabel = (actionType: string) => {
    switch (actionType) {
      case 'restock': return 'Restock Now';
      case 'view_details': return 'View Details';
      case 'generate_order': return 'Generate Order';
      case 'adjust_stock': return 'Adjust Stock';
      default: return 'Take Action';
    }
  };

  return (
    <>
      <Card className="p-6 bg-card border-border">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-warning" />
            Quick Actions
          </h3>
          <p className="text-sm text-muted-foreground">Alerts requiring attention</p>
        </div>

        <div className="space-y-3">
          {alerts.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No active alerts</p>
          ) : (
            alerts.map((alert) => {
              const Icon = getIcon(alert.type);
              return (
                <div 
                  key={alert.id}
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
                        <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                          {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">{alert.message}</p>
                      <Button 
                        size="sm" 
                        variant={alert.type === "critical" ? "destructive" : "secondary"}
                        className="w-full"
                        onClick={() => handleAction(alert)}
                      >
                        {getActionLabel(alert.action_type)}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-border">
          <Button variant="outline" className="w-full" onClick={() => setAllAlertsDialog(true)}>
            View All Alerts
          </Button>
        </div>
      </Card>

      <RestockDialog
        open={restockDialog.open}
        onOpenChange={(open) => setRestockDialog({ ...restockDialog, open })}
        productId={restockDialog.productId}
        productName={restockDialog.productName}
        currentStock={restockDialog.currentStock}
      />
      <ProductDetailsDialog
        open={detailsDialog.open}
        onOpenChange={(open) => setDetailsDialog({ ...detailsDialog, open })}
        product={detailsDialog.product}
      />
      <GenerateOrderDialog
        open={generateOrderDialog}
        onOpenChange={setGenerateOrderDialog}
      />
      <AdjustStockDialog
        open={adjustStockDialog.open}
        onOpenChange={(open) => setAdjustStockDialog({ ...adjustStockDialog, open })}
        productId={adjustStockDialog.productId}
        productName={adjustStockDialog.productName}
        currentStock={adjustStockDialog.currentStock}
      />
      <AllAlertsDialog
        open={allAlertsDialog}
        onOpenChange={setAllAlertsDialog}
      />
    </>
  );
};

export default QuickActions;
