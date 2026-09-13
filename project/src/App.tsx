import { useState, useEffect, useCallback } from "react";
import { GlobalStyle, PromoBar } from "@/components/shared";
import { supabase, type Product, type Category, type Order, type OrderItem, type DeliveryZone, type SiteSettings, type CartItem } from "@/lib/supabase";
import { NavBar, HomePage, ShopPage, CartPage, AboutPage, FaqPage, ContactPage } from "@/components/client-app";
import { AdminDashboard } from "@/components/admin-app";
import { AdminLogin } from "@/components/admin-login";

const TOKEN_KEY = "eglantine_admin_token";

export default function App() {
  const [view, setView] = useState("home");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [adminToken, setAdminToken] = useState<string | null>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = !!adminToken;

  const loadPublicData = useCallback(async () => {
    const [p, c, dz, ss] = await Promise.all([
      supabase.from("products").select("*").order("sort_order", { ascending: true }),
      supabase.from("categories").select("*").order("sort_order", { ascending: true }),
      supabase.from("delivery_zones").select("*").order("sort_order", { ascending: true }),
      supabase.from("site_settings").select("*").eq("id", 1).maybeSingle(),
    ]);

    if (p.data) setProducts(p.data as Product[]);
    if (c.data) setCategories(c.data as Category[]);
    if (dz.data) setDeliveryZones(dz.data as DeliveryZone[]);
    if (ss.data) setSiteSettings(ss.data as SiteSettings);
    setLoading(false);
  }, []);

  const loadAdminData = useCallback(async (token: string) => {
    const { data, error } = await supabase.rpc("admin_get_data", { p_token: token });
    if (error || !data || (data as Record<string, unknown>).error === "invalid_token") {
      localStorage.removeItem(TOKEN_KEY);
      setAdminToken(null);
      setView("admin-login");
      return;
    }
    const d = data as { orders: Order[]; order_items: OrderItem[]; deliverers: never[] };
    setOrders(d.orders || []);
    setOrderItems(d.order_items || []);
  }, []);

  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY);
    if (savedToken) {
      setAdminToken(savedToken);
      loadAdminData(savedToken);
    }
    loadPublicData();

    const checkHash = () => {
      if (window.location.hash === "#admin") setView("admin-login");
    };
    checkHash();
    window.addEventListener("hashchange", checkHash);
    return () => window.removeEventListener("hashchange", checkHash);
  }, [loadPublicData, loadAdminData]);

  const handleLogin = (token: string) => {
    localStorage.setItem(TOKEN_KEY, token);
    setAdminToken(token);
    loadAdminData(token);
    setView("dashboard");
  };

  const handleLogout = async () => {
    if (adminToken) {
      await supabase.rpc("admin_logout", { p_token: adminToken });
    }
    localStorage.removeItem(TOKEN_KEY);
    setAdminToken(null);
    setView("home");
  };

  const handleAdminDataChange = () => {
    if (adminToken) loadAdminData(adminToken);
    loadPublicData();
  };

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#FDF6EE" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🍝</div>
          <p style={{ color: "#7A6E65", fontSize: 16 }}>Chargement de Maison Églantine...</p>
        </div>
      </div>
    );
  }

  if (view === "admin-login" || (view === "dashboard" && !isAdmin)) {
    return (
      <>
        <GlobalStyle />
        <AdminLogin onSuccess={handleLogin} />
      </>
    );
  }

  return (
    <>
      <GlobalStyle />
      <PromoBar />
      <NavBar view={view} setView={setView} cartCount={cartCount} isAdmin={isAdmin} onLogout={handleLogout} />
      <main>
        {view === "home" && <HomePage setView={setView} products={products} />}
        {view === "shop" && <ShopPage products={products} categories={categories} cart={cart} setCart={setCart} />}
        {view === "cart" && <CartPage cart={cart} setCart={setCart} setView={setView} deliveryZones={deliveryZones} products={products} onOrderPlaced={loadPublicData} />}
        {view === "about" && <AboutPage />}
        {view === "faq" && <FaqPage />}
        {view === "contact" && <ContactPage siteInfo={siteSettings} />}
        {view === "dashboard" && isAdmin && (
          <AdminDashboard
            products={products}
            categories={categories}
            orders={orders}
            orderItems={orderItems}
            deliveryZones={deliveryZones}
            siteSettings={siteSettings}
            onDataChange={handleAdminDataChange}
            adminToken={adminToken!}
          />
        )}
      </main>
    </>
  );
}
