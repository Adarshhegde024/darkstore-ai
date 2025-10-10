import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, Package, TrendingUp, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

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

interface ProductDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product;
}

export const ProductDetailsDialog = ({ open, onOpenChange, product }: ProductDetailsDialogProps) => {
  if (!product) return null;

  const daysUntilExpiry = product.expiry_date 
    ? Math.ceil((new Date(product.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Product Details
          </DialogTitle>
          <DialogDescription>
            Complete information about {product.name}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Product Name</span>
              <span className="font-semibold">{product.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Category</span>
              <Badge variant="secondary">{product.category}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Current Stock</span>
              <span className="font-semibold">{product.stock} units</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Reorder Threshold</span>
              <span className="font-semibold">{product.reorder_threshold} units</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Price</span>
              <span className="font-semibold text-primary">₹{product.price}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Demand Level
              </span>
              <Badge className={
                product.demand_level === 'high' ? 'bg-success/20 text-success' :
                product.demand_level === 'medium' ? 'bg-warning/20 text-warning' :
                'bg-muted text-muted-foreground'
              }>
                {product.demand_level}
              </Badge>
            </div>
            {product.expiry_date && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Expiry Date
                </span>
                <div className="text-right">
                  <p className="font-semibold">{format(new Date(product.expiry_date), 'MMM dd, yyyy')}</p>
                  {daysUntilExpiry !== null && daysUntilExpiry <= 7 && (
                    <p className="text-xs text-warning flex items-center gap-1 justify-end">
                      <AlertTriangle className="w-3 h-3" />
                      {daysUntilExpiry} days left
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {product.stock < product.reorder_threshold && (
            <div className="p-3 bg-warning/10 rounded-lg border border-warning/30">
              <p className="text-sm text-warning font-medium">
                ⚠️ Stock is below reorder threshold
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Consider restocking to maintain optimal inventory levels
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
