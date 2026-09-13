import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(url, anonKey, {
  auth: { persistSession: true, autoRefreshToken: true },
});

export type Category = {
  id: number;
  name: string;
  sort_order: number;
};

export type Product = {
  id: number;
  category_id: number;
  name: string;
  description: string;
  price: number;
  unit: string;
  stock: number;
  active: boolean;
  low_stock_alert: number;
  emoji: string;
  badge: string | null;
  reviews: number;
  image_url: string;
  sort_order: number;
};

export type DeliveryZone = {
  id: number;
  name: string;
  price: number;
  sort_order: number;
};

export type Deliverer = {
  id: number;
  name: string;
  phone: string;
  zone: string;
  active: boolean;
};

export type OrderStatus =
  | "Nouvelle"
  | "Confirmée"
  | "En préparation"
  | "Prête"
  | "En livraison"
  | "Livrée"
  | "Annulée";

export type Order = {
  id: number;
  order_number: number;
  client_name: string;
  client_phone: string;
  client_address: string;
  zone: string;
  delivery_fee: number;
  notes: string;
  total: number;
  payment_mode: string;
  status: OrderStatus;
  deliverer_id: number | null;
  created_at: string;
};

export type OrderItem = {
  id: number;
  order_id: number;
  product_id: number | null;
  name: string;
  qty: number;
  price: number;
};

export type SiteSettings = {
  id: number;
  phone: string;
  instagram: string;
  address: string;
  hours: string;
};

export type CartItem = {
  id: number;
  name: string;
  price: number;
  qty: number;
  image_url: string;
  emoji: string;
  unit: string;
};
