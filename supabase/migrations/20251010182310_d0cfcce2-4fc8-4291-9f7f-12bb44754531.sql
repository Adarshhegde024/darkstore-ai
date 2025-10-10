-- Create products table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  reorder_threshold INTEGER NOT NULL DEFAULT 10,
  price DECIMAL(10,2) NOT NULL,
  expiry_date TIMESTAMP WITH TIME ZONE,
  demand_level TEXT CHECK (demand_level IN ('low', 'medium', 'high')) DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create alerts table
CREATE TABLE IF NOT EXISTS public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT CHECK (type IN ('critical', 'warning', 'low', 'insight')) NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  is_resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  order_type TEXT CHECK (order_type IN ('restock', 'adjustment', 'generated')) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')) DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Create public read policies (anyone can view)
CREATE POLICY "Public read access for products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Public read access for alerts" ON public.alerts FOR SELECT USING (true);
CREATE POLICY "Public read access for orders" ON public.orders FOR SELECT USING (true);

-- Create public write policies (anyone can modify)
CREATE POLICY "Public insert access for products" ON public.products FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access for products" ON public.products FOR UPDATE USING (true);
CREATE POLICY "Public delete access for products" ON public.products FOR DELETE USING (true);

CREATE POLICY "Public insert access for alerts" ON public.alerts FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access for alerts" ON public.alerts FOR UPDATE USING (true);
CREATE POLICY "Public delete access for alerts" ON public.alerts FOR DELETE USING (true);

CREATE POLICY "Public insert access for orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access for orders" ON public.orders FOR UPDATE USING (true);
CREATE POLICY "Public delete access for orders" ON public.orders FOR DELETE USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO public.products (name, category, stock, reorder_threshold, price, demand_level, expiry_date) VALUES
  ('Amul Milk 1L', 'Dairy', 124, 50, 62.00, 'high', NULL),
  ('Lays Classic 52g', 'Snacks', 8, 20, 20.00, 'high', NULL),
  ('Coca Cola 750ml', 'Beverages', 245, 100, 40.00, 'medium', NULL),
  ('Britannia Bread', 'Bakery', 32, 25, 35.00, 'high', now() + interval '3 days'),
  ('Tata Salt 1kg', 'Grocery', 156, 30, 25.00, 'low', NULL),
  ('Red Bull 250ml', 'Beverages', 5, 15, 125.00, 'medium', NULL),
  ('Parle-G 376g', 'Snacks', 89, 40, 45.00, 'high', NULL),
  ('Haldiram Bhujia', 'Snacks', 15, 25, 55.00, 'high', NULL);

-- Insert sample alerts based on products
INSERT INTO public.alerts (type, title, message, product_id, action_type) 
SELECT 'critical', 'Critical Stock Alert', name || ' down to ' || stock || ' units', id, 'restock'
FROM public.products WHERE stock <= 5;

INSERT INTO public.alerts (type, title, message, product_id, action_type)
SELECT 'warning', 'Expiry Warning', stock || ' units of ' || name || ' expire in 3 days', id, 'view_details'
FROM public.products WHERE expiry_date IS NOT NULL AND expiry_date < now() + interval '4 days';

INSERT INTO public.alerts (type, title, message, action_type)
VALUES ('low', 'Low Stock', (SELECT COUNT(*)::TEXT FROM public.products WHERE stock < reorder_threshold) || ' SKUs below reorder threshold', 'generate_order');

INSERT INTO public.alerts (type, title, message, product_id, action_type)
SELECT 'insight', 'Demand Spike Detected', name || ' trending +45% today', id, 'adjust_stock'
FROM public.products WHERE name LIKE '%Bhujia%';

-- Enable realtime
ALTER TABLE public.products REPLICA IDENTITY FULL;
ALTER TABLE public.alerts REPLICA IDENTITY FULL;
ALTER TABLE public.orders REPLICA IDENTITY FULL;