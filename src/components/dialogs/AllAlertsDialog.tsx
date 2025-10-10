import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, Clock, Package, TrendingUp, CheckCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Alert {
  id: string;
  type: string;
  title: string;
  message: string;
  is_resolved: boolean;
  created_at: string;
}

interface AllAlertsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AllAlertsDialog = ({ open, onOpenChange }: AllAlertsDialogProps) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filter, setFilter] = useState<'all' | 'active'>('active');

  useEffect(() => {
    if (open) {
      fetchAlerts();
    }
  }, [open, filter]);

  const fetchAlerts = async () => {
    let query = supabase
      .from('alerts')
      .select('*')
      .order('created_at', { ascending: false });

    if (filter === 'active') {
      query = query.eq('is_resolved', false);
    }

    const { data } = await query;
    if (data) setAlerts(data);
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

  const getAlertStyle = (type: string) => {
    switch (type) {
      case "critical": return "border-destructive/50 bg-destructive/5";
      case "warning": return "border-warning/50 bg-warning/5";
      case "low": return "border-warning/30 bg-warning/5";
      case "insight": return "border-primary/30 bg-primary/5";
      default: return "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              All Alerts
            </span>
            <div className="flex gap-2">
              <Button
                variant={filter === 'active' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('active')}
              >
                Active
              </Button>
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                All
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto space-y-3 py-4">
          {alerts.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {filter === 'active' ? 'No active alerts' : 'No alerts found'}
            </p>
          ) : (
            alerts.map((alert) => {
              const Icon = getIcon(alert.type);
              return (
                <div
                  key={alert.id}
                  className={`p-4 rounded-lg border transition-all ${getAlertStyle(alert.type)} ${
                    alert.is_resolved ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      alert.type === "critical" ? "bg-destructive/20" :
                      alert.type === "warning" ? "bg-warning/20" :
                      alert.type === "low" ? "bg-warning/20" :
                      "bg-primary/20"
                    }`}>
                      <Icon className={`w-4 h-4 ${
                        alert.type === "critical" ? "text-destructive" :
                        alert.type === "warning" ? "text-warning" :
                        "text-primary"
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-sm">{alert.title}</h4>
                          {alert.is_resolved && (
                            <Badge className="bg-success/20 text-success">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Resolved
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                          {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{alert.message}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
