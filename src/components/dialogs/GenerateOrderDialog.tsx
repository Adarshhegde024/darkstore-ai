import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart } from "lucide-react";

interface Product {
  id: string;
  name: string;
  stock: number;
  reorder_threshold: number;
}

interface GenerateOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const GenerateOrderDialog = ({ open, onOpenChange }: GenerateOrderDialogProps) => {
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchLowStockProducts();
    }
  }, [open]);

  const fetchLowStockProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('id, name, stock, reorder_threshold');
    
    if (data) {
      const filtered = data.filter(p => p.stock < p.reorder_threshold);
      setLowStockProducts(filtered);
      setSelectedProducts(new Set(filtered.map(p => p.id)));
    }
  };

  const toggleProduct = (productId: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  const handleGenerateOrder = async () => {
    setLoading(true);
    try {
      const orders = lowStockProducts
        .filter(p => selectedProducts.has(p.id))
        .map(p => ({
          product_id: p.id,
          quantity: p.reorder_threshold - p.stock + 10,
          order_type: 'generated' as const,
          status: 'pending' as const,
          notes: `Auto-generated order for ${p.name}`
        }));

      const { error } = await supabase.from('orders').insert(orders);
      if (error) throw error;

      // Mark low stock alerts as resolved
      await supabase
        .from('alerts')
        .update({ is_resolved: true })
        .eq('action_type', 'generate_order');

      toast({
        title: "Orders Generated",
        description: `${orders.length} purchase orders created successfully`,
      });

      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Generate Purchase Orders
          </DialogTitle>
          <DialogDescription>
            Select products to include in the purchase order
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-96 overflow-y-auto space-y-2 py-4">
          {lowStockProducts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No products below reorder threshold
            </p>
          ) : (
            lowStockProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center space-x-3 p-3 rounded-lg border bg-secondary/30 hover:bg-secondary/50 transition-colors"
              >
                <Checkbox
                  checked={selectedProducts.has(product.id)}
                  onCheckedChange={() => toggleProduct(product.id)}
                />
                <div className="flex-1">
                  <p className="font-medium text-sm">{product.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Current: {product.stock} | Threshold: {product.reorder_threshold} | 
                    Order: {product.reorder_threshold - product.stock + 10} units
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleGenerateOrder} 
            disabled={loading || selectedProducts.size === 0}
          >
            {loading ? "Generating..." : `Generate ${selectedProducts.size} Orders`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
