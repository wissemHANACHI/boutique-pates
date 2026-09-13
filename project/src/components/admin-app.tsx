import { useState, useEffect } from "react";
import { supabase, type Product, type Category, type Order, type OrderItem, type DeliveryZone, type SiteSettings, fmt, StatusBadge, ORDER_STATUSES, BRAND } from "@/components/shared-deps";

type OrderWithItems = Order & { items: OrderItem[] };

export function AdminDashboard({
  products,
  categories,
  orders,
  orderItems,
  deliveryZones,
  siteSettings,
  onDataChange,
  adminToken,
}: {
  products: Product[];
  categories: Category[];
  orders: Order[];
  orderItems: OrderItem[];
  deliveryZones: DeliveryZone[];
  siteSettings: SiteSettings | null;
  onDataChange: () => void;
  adminToken: string;
}) {
  const [tab, setTab] = useState("orders");
  const tabs: [string, string][] = [
    ["orders", "Commandes"],
    ["products", "Produits"],
    ["stock", "Stock"],
    ["clients", "Clients"],
    ["zones", "Zones"],
    ["stats", "Stats"],
    ["settings", "Paramètres"],
  ];

  const totalRevenue = orders.filter((o) => o.status === "Livrée").reduce((s, o) => s + o.total, 0);
  const newOrders = orders.filter((o) => o.status === "Nouvelle").length;
  const lowStock = products.filter((p) => p.stock <= p.low_stock_alert && p.active).length;

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 16px" }}>
      <h2 className="serif" style={{ fontSize: 26, color: BRAND.teal, marginBottom: 20 }}>Administration</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12, marginBottom: 24 }}>
        {[["📋", newOrders, "Nouvelles commandes", BRAND.orange], ["💰", fmt(totalRevenue), "CA total livré", BRAND.teal], ["📦", lowStock, "Stock faible", BRAND.red], ["🍝", products.filter((p) => p.active).length, "Produits actifs", BRAND.green]].map(([e, v, l, c]) => (
          <div key={l as string} style={{ background: "#fff", borderRadius: 12, padding: 16, boxShadow: "0 1px 8px #0001", borderLeft: `4px solid ${c as string}` }}>
            <div style={{ fontSize: 22 }}>{e as string}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: c as string }}>{v as string | number}</div>
            <div style={{ fontSize: 12, color: BRAND.warmGrey }}>{l as string}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
        {tabs.map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} style={{ padding: "8px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600, background: tab === k ? BRAND.teal : "#fff", color: tab === k ? "#fff" : BRAND.dark, border: `1.5px solid ${tab === k ? BRAND.teal : BRAND.teal + "44"}` }}>{l}</button>
        ))}
      </div>
      <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 2px 16px rgba(0,0,0,.06)" }}>
        {tab === "orders" && <AdminOrders orders={orders} orderItems={orderItems} onDataChange={onDataChange} adminToken={adminToken} />}
        {tab === "products" && <AdminProducts products={products} categories={categories} onDataChange={onDataChange} adminToken={adminToken} />}
        {tab === "stock" && <AdminStock products={products} onDataChange={onDataChange} adminToken={adminToken} />}
        {tab === "clients" && <AdminClients orders={orders} />}
        {tab === "zones" && <AdminZones deliveryZones={deliveryZones} onDataChange={onDataChange} adminToken={adminToken} />}
        {tab === "stats" && <AdminStats orders={orders} orderItems={orderItems} products={products} />}
        {tab === "settings" && <AdminSettings siteSettings={siteSettings} onDataChange={onDataChange} adminToken={adminToken} />}
      </div>
    </div>
  );
}

function AdminOrders({ orders, orderItems, onDataChange, adminToken }: { orders: Order[]; orderItems: OrderItem[]; onDataChange: () => void; adminToken: string }) {
  const [filter, setFilter] = useState("Toutes");
  const [error, setError] = useState<string | null>(null);
  const filtered = filter === "Toutes" ? orders : orders.filter((o) => o.status === filter);

  const updateStatus = async (id: number, status: string) => {
    setError(null);
    const { error: rpcError } = await supabase.rpc("admin_update_order_status", { p_token: adminToken, p_order_id: id, p_status: status });
    if (rpcError) { setError(rpcError.message); return; }
    onDataChange();
  };

  return (
    <div>
      {error && (
        <div style={{ background: "#FDEDEC", color: BRAND.red, borderRadius: 10, padding: "10px 14px", marginBottom: 14, fontSize: 13, fontWeight: 600 }}>⚠️ {error}</div>
      )}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
        {["Toutes", ...ORDER_STATUSES].map((s) => (
          <button key={s} onClick={() => setFilter(s)} style={{ padding: "5px 12px", borderRadius: 16, fontSize: 12, fontWeight: 600, background: filter === s ? BRAND.teal : "#fff", color: filter === s ? "#fff" : BRAND.dark, border: `1.5px solid ${BRAND.teal}44` }}>{s}</button>
        ))}
      </div>
      {filtered.length === 0 && <p style={{ color: BRAND.warmGrey, padding: 24, textAlign: "center" }}>Aucune commande.</p>}
      {filtered.map((o) => {
        const items = orderItems.filter((i) => i.order_id === o.id);
        return (
          <div key={o.id} style={{ background: "#fff", borderRadius: 12, padding: "16px 20px", marginBottom: 12, boxShadow: "0 1px 8px #0001" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 8 }}>
              <span style={{ fontWeight: 800, fontSize: 15 }}>#{o.order_number}</span>
              <StatusBadge status={o.status} />
              <span style={{ fontSize: 13, color: BRAND.warmGrey }}>{new Date(o.created_at).toLocaleString("fr-DZ")}</span>
              <span style={{ marginLeft: "auto", fontWeight: 800, color: BRAND.orange, fontSize: 16 }}>{fmt(o.total)}</span>
            </div>
            <div style={{ fontSize: 13, color: BRAND.dark, marginBottom: 4 }}>{o.client_name} · {o.client_phone} · {o.client_address} · {o.zone}</div>
            <div style={{ fontSize: 12, color: BRAND.warmGrey, marginBottom: 8 }}>{items.map((i) => `${i.name} x${i.qty}`).join(" · ")}{o.notes && ` · Note: ${o.notes}`}</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {ORDER_STATUSES.filter((s) => s !== o.status && s !== "Annulée").map((s) => (
                <button key={s} onClick={() => updateStatus(o.id, s)} style={{ padding: "4px 10px", borderRadius: 8, fontSize: 11, fontWeight: 600, background: BRAND.cream, color: BRAND.teal, border: `1px solid ${BRAND.teal}44` }}>→ {s}</button>
              ))}
              {o.status !== "Annulée" && <button onClick={() => updateStatus(o.id, "Annulée")} style={{ padding: "4px 10px", borderRadius: 8, fontSize: 11, fontWeight: 600, background: "#FDEDEC", color: BRAND.red, border: `1px solid ${BRAND.red}44` }}>Annuler</button>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AdminProducts({ products, categories, onDataChange, adminToken }: { products: Product[]; categories: Category[]; onDataChange: () => void; adminToken: string }) {
  const empty: Omit<Product, "id" | "created_at" | "sort_order" | "reviews"> = {
    category_id: 1, name: "", description: "", price: 500, unit: "320g", stock: 20,
    active: true, low_stock_alert: 5, emoji: "🍝", badge: null, image_url: "",
  };
  const [editing, setEditing] = useState<number | "new" | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>(empty as Record<string, unknown>);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setError(null);
    const { error: rpcError } = await supabase.rpc("admin_upsert_product", {
      p_token: adminToken,
      p_id: editing === "new" ? 0 : (typeof editing === "number" ? editing : 0),
      p_category_id: form.category_id as number,
      p_name: form.name as string,
      p_description: form.description as string,
      p_price: form.price as number,
      p_unit: form.unit as string,
      p_stock: form.stock as number,
      p_active: form.active as boolean,
      p_low_stock_alert: form.low_stock_alert as number,
      p_emoji: form.emoji as string,
      p_badge: (form.badge as string) || "",
      p_image_url: form.image_url as string,
      p_sort_order: (form.sort_order as number) || 0,
    });
    if (rpcError) { setError(rpcError.message); return; }
    setEditing(null);
    onDataChange();
  };

  const del = async (id: number) => {
    setError(null);
    const { error: rpcErr } = await supabase.rpc("admin_delete_product", { p_token: adminToken, p_id: id });
    if (rpcErr) { setError(rpcErr.message); return; }
    onDataChange();
  };

  return (
    <div>
      {error && (
        <div style={{ background: "#FDEDEC", color: BRAND.red, borderRadius: 10, padding: "10px 14px", marginBottom: 14, fontSize: 13, fontWeight: 600 }}>⚠️ {error}</div>
      )}
      <button onClick={() => { setForm(empty as Record<string, unknown>); setEditing("new"); }} style={{ background: BRAND.orange, color: "#fff", padding: "9px 20px", borderRadius: 20, fontWeight: 700, fontSize: 14, marginBottom: 16 }}>+ Nouveau produit</button>
      {editing && (
        <div style={{ background: "#fff", borderRadius: 12, padding: 24, marginBottom: 20, boxShadow: "0 2px 16px #0002" }}>
          <h3 style={{ fontWeight: 700, marginBottom: 16, color: BRAND.teal }}>{editing === "new" ? "Nouveau produit" : "Modifier le produit"}</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {([["name", "Nom", "text"], ["description", "Description", "text"], ["unit", "Unite", "text"], ["emoji", "Emoji", "text"], ["image_url", "URL Photo", "text"], ["badge", "Badge", "text"]] as [string, string, string][]).map(([k, l, t]) => (
              <div key={k}>
                <label style={{ fontSize: 12, fontWeight: 600, display: "block", marginBottom: 4 }}>{l}</label>
                <input type={t} value={(form[k] as string) || ""} onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))} style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: `1.5px solid ${BRAND.teal}44`, fontSize: 13 }} />
              </div>
            ))}
            {([["price", "Prix (DA)", "number"], ["stock", "Stock", "number"], ["low_stock_alert", "Alerte stock", "number"]] as [string, string, string][]).map(([k, l, t]) => (
              <div key={k}>
                <label style={{ fontSize: 12, fontWeight: 600, display: "block", marginBottom: 4 }}>{l}</label>
                <input type={t} value={(form[k] as number) || 0} onChange={(e) => setForm((f) => ({ ...f, [k]: Number(e.target.value) }))} style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: `1.5px solid ${BRAND.teal}44`, fontSize: 13 }} />
              </div>
            ))}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, display: "block", marginBottom: 4 }}>Catégorie</label>
              <select value={form.category_id as number} onChange={(e) => setForm((f) => ({ ...f, category_id: Number(e.target.value) }))} style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: `1.5px solid ${BRAND.teal}44`, fontSize: 13 }}>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, paddingTop: 20 }}>
              <input type="checkbox" checked={form.active as boolean} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} id="active" />
              <label htmlFor="active" style={{ fontSize: 13, fontWeight: 600 }}>Produit actif</label>
            </div>
          </div>
          {(form.image_url as string) && (
            <div style={{ marginTop: 12, borderRadius: 8, overflow: "hidden", width: 120, height: 80 }}>
              <img src={form.image_url as string} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          )}
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button onClick={save} style={{ background: BRAND.teal, color: "#fff", padding: "9px 20px", borderRadius: 20, fontWeight: 700 }}>Enregistrer</button>
            <button onClick={() => setEditing(null)} style={{ background: BRAND.cream, color: BRAND.dark, padding: "9px 20px", borderRadius: 20, fontWeight: 600 }}>Annuler</button>
          </div>
        </div>
      )}
      <div style={{ display: "grid", gap: 10 }}>
        {products.map((p) => (
          <div key={p.id} style={{ background: "#fff", borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, boxShadow: "0 1px 6px #0001", opacity: p.active ? 1 : .6 }}>
            <div style={{ width: 48, height: 48, borderRadius: 8, overflow: "hidden", flexShrink: 0 }}>
              <img src={p.image_url} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{p.name} {!p.active && <span style={{ fontSize: 11, color: BRAND.red }}>(inactif)</span>}</div>
              <div style={{ fontSize: 12, color: BRAND.warmGrey }}>{fmt(p.price)} · Stock: {p.stock}</div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => { setForm(p as unknown as Record<string, unknown>); setEditing(p.id); }} style={{ background: BRAND.cream, color: BRAND.teal, padding: "5px 12px", borderRadius: 8, fontWeight: 600, fontSize: 12 }}>Modifier</button>
              <button onClick={() => del(p.id)} style={{ background: "#FDEDEC", color: BRAND.red, padding: "5px 12px", borderRadius: 8, fontWeight: 600, fontSize: 12 }}>Supprimer</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminStock({ products, onDataChange, adminToken }: { products: Product[]; onDataChange: () => void; adminToken: string }) {
  const [edit, setEdit] = useState<Record<number, number>>({});
  const [error, setError] = useState<string | null>(null);
  const low = products.filter((p) => p.stock <= p.low_stock_alert && p.active);

  const updateStock = async (id: number, stock: number) => {
    setError(null);
    const { error: rpcError } = await supabase.rpc("admin_update_stock", { p_token: adminToken, p_id: id, p_stock: stock });
    if (rpcError) { setError(rpcError.message); return; }
    onDataChange();
  };

  return (
    <div>
      {error && (
        <div style={{ background: "#FDEDEC", color: BRAND.red, borderRadius: 10, padding: "10px 14px", marginBottom: 14, fontSize: 13, fontWeight: 600 }}>⚠️ {error}</div>
      )}
      {low.length > 0 && (
        <div style={{ background: "#FEF9E7", border: `1.5px solid ${BRAND.orange}`, borderRadius: 12, padding: "12px 16px", marginBottom: 20 }}>
          <div style={{ fontWeight: 700, color: BRAND.orange, marginBottom: 8 }}>Stock faible ({low.length} produit{low.length > 1 ? "s" : ""})</div>
          {low.map((p) => <div key={p.id} style={{ fontSize: 13 }}>{p.emoji} {p.name} — {p.stock} restant{p.stock > 1 ? "s" : ""}</div>)}
        </div>
      )}
      <div style={{ display: "grid", gap: 8 }}>
        {products.map((p) => (
          <div key={p.id} style={{ background: "#fff", borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 20 }}>{p.emoji}</span>
            <div style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>{p.name}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input type="number" defaultValue={p.stock} onChange={(e) => setEdit((x) => ({ ...x, [p.id]: Number(e.target.value) }))} style={{ width: 70, padding: "6px", borderRadius: 8, border: `1.5px solid ${BRAND.teal}44`, textAlign: "center", fontSize: 14 }} />
              <button onClick={() => updateStock(p.id, edit[p.id] ?? p.stock)} style={{ background: BRAND.teal, color: "#fff", padding: "6px 14px", borderRadius: 8, fontWeight: 700, fontSize: 13 }}>Màj</button>
            </div>
            <span style={{ fontSize: 12, color: p.stock <= p.low_stock_alert ? BRAND.red : BRAND.green, fontWeight: 700 }}>{p.stock <= p.low_stock_alert ? "Faible" : "OK"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminClients({ orders }: { orders: Order[] }) {
  const clients = [...new Map(orders.map((o) => [o.client_phone, o])).values()];
  return (
    <div>
      <p style={{ color: BRAND.warmGrey, marginBottom: 16, fontSize: 14 }}>{clients.length} client(s) enregistré(s)</p>
      {clients.map((o) => {
        const userOrders = orders.filter((x) => x.client_phone === o.client_phone);
        const spent = userOrders.reduce((s, x) => s + x.total, 0);
        return (
          <div key={o.client_phone} style={{ background: "#fff", borderRadius: 10, padding: "14px 18px", marginBottom: 10, display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ fontSize: 28 }}>👤</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700 }}>{o.client_name}</div>
              <div style={{ fontSize: 13, color: BRAND.warmGrey }}>{o.client_phone} · {userOrders.length} commande(s)</div>
            </div>
            <div style={{ fontWeight: 800, color: BRAND.orange }}>{fmt(spent)}</div>
          </div>
        );
      })}
      {clients.length === 0 && <p style={{ color: BRAND.warmGrey, textAlign: "center", padding: 32 }}>Aucun client pour l'instant.</p>}
    </div>
  );
}

function AdminZones({ deliveryZones, onDataChange, adminToken }: { deliveryZones: DeliveryZone[]; onDataChange: () => void; adminToken: string }) {
  const [editing, setEditing] = useState<Record<number, { name: string; price: number }>>({});
  const [error, setError] = useState<string | null>(null);

  const update = async (z: DeliveryZone) => {
    setError(null);
    const e = editing[z.id] || { name: z.name, price: z.price };
    const { error: rpcError } = await supabase.rpc("admin_update_zone", { p_token: adminToken, p_id: z.id, p_name: e.name, p_price: e.price });
    if (rpcError) { setError(rpcError.message); return; }
    setEditing((prev) => { const n = { ...prev }; delete n[z.id]; return n; });
    onDataChange();
  };

  return (
    <div>
      {error && (
        <div style={{ background: "#FDEDEC", color: BRAND.red, borderRadius: 10, padding: "10px 14px", marginBottom: 14, fontSize: 13, fontWeight: 600 }}>⚠️ {error}</div>
      )}
      <p style={{ color: BRAND.warmGrey, marginBottom: 16, fontSize: 14 }}>Zones et frais de livraison</p>
      {deliveryZones.map((z) => {
        const e = editing[z.id] || { name: z.name, price: z.price };
        return (
          <div key={z.id} style={{ background: "#fff", borderRadius: 10, padding: "14px 18px", marginBottom: 10, display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 20 }}>🗺️</span>
            <input value={e.name} onChange={(ev) => setEditing((prev) => ({ ...prev, [z.id]: { ...e, name: ev.target.value } }))} style={{ flex: 1, padding: "6px 10px", borderRadius: 8, border: `1.5px solid ${BRAND.teal}44`, fontSize: 13 }} />
            <input type="number" value={e.price} onChange={(ev) => setEditing((prev) => ({ ...prev, [z.id]: { ...e, price: Number(ev.target.value) } }))} style={{ width: 80, padding: "6px 10px", borderRadius: 8, border: `1.5px solid ${BRAND.teal}44`, fontSize: 13, textAlign: "center" }} />
            <button onClick={() => update(z)} style={{ background: BRAND.teal, color: "#fff", padding: "6px 14px", borderRadius: 8, fontWeight: 700, fontSize: 13 }}>Màj</button>
          </div>
        );
      })}
    </div>
  );
}

function AdminStats({ orders, orderItems, products }: { orders: Order[]; orderItems: OrderItem[]; products: Product[] }) {
  const byStatus = ORDER_STATUSES.reduce((acc, s) => { acc[s] = orders.filter((o) => o.status === s).length; return acc; }, {} as Record<string, number>);
  const revenue = orders.filter((o) => o.status === "Livrée").reduce((s, o) => s + o.total, 0);
  const topProducts = products.map((p) => {
    const sold = orderItems.filter((i) => i.product_id === p.id).reduce((s, i) => s + i.qty, 0);
    return { ...p, sold };
  }).sort((a, b) => b.sold - a.sold).slice(0, 5);

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 12, marginBottom: 24 }}>
        {[["📋", orders.length, "Total commandes", BRAND.teal], ["💰", fmt(revenue), "CA livré", BRAND.orange], ["✅", byStatus["Livrée"] || 0, "Livrées", BRAND.green], ["❌", byStatus["Annulée"] || 0, "Annulées", BRAND.red]].map(([e, v, l, c]) => (
          <div key={l as string} style={{ background: "#fff", borderRadius: 12, padding: 16, textAlign: "center", boxShadow: "0 1px 8px #0001", borderTop: `3px solid ${c as string}` }}>
            <div style={{ fontSize: 24 }}>{e as string}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: c as string }}>{v as string | number}</div>
            <div style={{ fontSize: 12, color: BRAND.warmGrey }}>{l as string}</div>
          </div>
        ))}
      </div>
      <h3 style={{ fontWeight: 700, marginBottom: 12, color: BRAND.teal }}>Top produits vendus</h3>
      {topProducts.filter((p) => p.sold > 0).map((p, i) => (
        <div key={p.id} style={{ background: "#fff", borderRadius: 10, padding: "12px 16px", marginBottom: 8, display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontWeight: 800, color: BRAND.teal, width: 20 }}>#{i + 1}</span>
          <span style={{ fontSize: 20 }}>{p.emoji}</span>
          <div style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>{p.name}</div>
          <span style={{ fontWeight: 700, color: BRAND.orange }}>{p.sold} vendus</span>
        </div>
      ))}
      {topProducts.every((p) => p.sold === 0) && <p style={{ color: BRAND.warmGrey, textAlign: "center", padding: 20 }}>Pas encore de ventes.</p>}
    </div>
  );
}

function AdminSettings({ siteSettings, onDataChange, adminToken }: { siteSettings: SiteSettings | null; onDataChange: () => void; adminToken: string }) {
  const [form, setForm] = useState<SiteSettings>(siteSettings || { id: 1, phone: "", instagram: "", address: "", hours: "" });
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (siteSettings) setForm(siteSettings);
  }, [siteSettings]);

  const save = async () => {
    setError(null);
    setSaved(false);
    const { error: rpcError } = await supabase.rpc("admin_update_settings", {
      p_token: adminToken,
      p_phone: form.phone,
      p_instagram: form.instagram,
      p_address: form.address,
      p_hours: form.hours,
    });
    if (rpcError) { setError(rpcError.message); return; }
    setSaved(true);
    onDataChange();
  };

  return (
    <div style={{ maxWidth: 500 }}>
      {error && (
        <div style={{ background: "#FDEDEC", color: BRAND.red, borderRadius: 10, padding: "10px 14px", marginBottom: 14, fontSize: 13, fontWeight: 600 }}>⚠️ {error}</div>
      )}
      {saved && (
        <div style={{ background: "#E8F8F0", color: BRAND.green, borderRadius: 10, padding: "10px 14px", marginBottom: 14, fontSize: 13, fontWeight: 600 }}>✓ Modifications enregistrées</div>
      )}
      <h3 style={{ fontWeight: 700, marginBottom: 16, color: BRAND.teal }}>Informations du site</h3>
      {([["phone", "Téléphone"], ["instagram", "Instagram"], ["address", "Adresse"], ["hours", "Horaires"]] as [keyof SiteSettings, string][]).map(([k, l]) => (
        <div key={k} style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>{l}</label>
          <input value={form[k]} onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${BRAND.teal}44`, fontSize: 14 }} />
        </div>
      ))}
      <button onClick={save} style={{ background: BRAND.teal, color: "#fff", padding: "10px 24px", borderRadius: 20, fontWeight: 700 }}>Enregistrer</button>
    </div>
  );
}
