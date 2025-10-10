import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Package } from "lucide-react";

interface RestockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId?: string;
  productName?: string;
  currentStock?: number;
}

export const RestockDialog = ({ open, onOpenChange, productId, productName, currentStock }: RestockDialogProps) => {
  const [quantity, setQuantity] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleRestock = async () => {
    if (!productId || !quantity) return;

    setLoading(true);
    try {
      const restockQty = parseInt(quantity);
      
      // Update product stock
      const { error: updateError } = await supabase
        .from('products')
        .update({ stock: (currentStock || 0) + restockQty })
        .eq('id', productId);

      if (updateError) throw updateError;

      // Create order record
      await supabase.from('orders').insert({
        product_id: productId,
        quantity: restockQty,
        order_type: 'restock',
        status: 'completed',
        notes: `Restocked ${productName}`
      });

      // Mark alert as resolved
      await supabase
        .from('alerts')
        .update({ is_resolved: true })
        .eq('product_id', productId)
        .eq('action_type', 'restock');

      toast({
        title: "Restocked Successfully",
        description: `Added ${restockQty} units of ${productName}`,
      });

      onOpenChange(false);
      setQuantity("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to restock product",
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
            <Package className="w-5 h-5" />
            Restock Product
          </DialogTitle>
          <DialogDescription>
            Add stock for {productName}. Current stock: {currentStock} units
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity to Add</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              placeholder="Enter quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleRestock} disabled={loading || !quantity}>
            {loading ? "Restocking..." : "Confirm Restock"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
