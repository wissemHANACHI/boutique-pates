// Re-export everything from shared.tsx for convenience
export { BRAND, ORDER_STATUSES, fmt, Stars, ArtisanSeal, GlobalStyle, PromoBar, TrustBar, StatusBadge, getBadgeClass } from "@/components/shared";
export type { Category, Product, DeliveryZone, Deliverer, OrderStatus, Order, OrderItem, SiteSettings, CartItem } from "@/lib/supabase";
export { supabase } from "@/lib/supabase";
