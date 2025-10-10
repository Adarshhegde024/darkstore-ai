import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { TrendingUp } from "lucide-react";

interface AdjustStockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId?: string;
  productName?: string;
  currentStock?: number;
}

export const AdjustStockDialog = ({ open, onOpenChange, productId, productName, currentStock }: AdjustStockDialogProps) => {
  const [adjustment, setAdjustment] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleAdjust = async () => {
    if (!productId || !adjustment) return;

    setLoading(true);
    try {
      const adjustQty = parseInt(adjustment);
      const newStock = (currentStock || 0) + adjustQty;

      // Update product stock
      const { error: updateError } = await supabase
        .from('products')
        .update({ stock: newStock })
        .eq('id', productId);

      if (updateError) throw updateError;

      // Create order record
      await supabase.from('orders').insert({
        product_id: productId,
        quantity: Math.abs(adjustQty),
        order_type: 'adjustment',
        status: 'completed',
        notes: notes || `Stock adjusted for ${productName}: ${adjustQty > 0 ? '+' : ''}${adjustQty}`
      });

      // Mark related alerts as resolved
      await supabase
        .from('alerts')
        .update({ is_resolved: true })
        .eq('product_id', productId)
        .eq('action_type', 'adjust_stock');

      toast({
        title: "Stock Adjusted",
        description: `${productName} stock updated to ${newStock} units`,
      });

      onOpenChange(false);
      setAdjustment("");
      setNotes("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to adjust stock",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Adjust Stock
          </DialogTitle>
          <DialogDescription>
            Adjust stock for {productName}. Current: {currentStock} units
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="adjustment">Adjustment (use - for decrease)</Label>
            <Input
              id="adjustment"
              type="number"
              placeholder="e.g. +20 or -10"
              value={adjustment}
              onChange={(e) => setAdjustment(e.target.value)}
            />
            {adjustment && (
              <p className="text-xs text-muted-foreground">
                New stock will be: {(currentStock || 0) + parseInt(adjustment || "0")} units
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Reason for adjustment..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAdjust} disabled={loading || !adjustment}>
            {loading ? "Adjusting..." : "Confirm Adjustment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
