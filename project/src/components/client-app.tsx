import { useState, useEffect, useMemo } from "react";
import { supabase, type Product, type Category, type DeliveryZone, type CartItem, type SiteSettings, fmt, Stars, ArtisanSeal, TrustBar, getBadgeClass, BRAND } from "@/components/shared-deps";

const HERO_BG = "https://images.pexels.com/photos/12703733/pexels-photo-12703733.jpeg?auto=compress&cs=tinysrgb&h=1200&w=1600";

export function NavBar({
  view,
  setView,
  cartCount,
  isAdmin,
  onLogout,
}: {
  view: string;
  setView: (v: string) => void;
  cartCount: number;
  isAdmin: boolean;
  onLogout: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <nav style={{ background: BRAND.teal, color: "#fff", position: "sticky", top: 0, zIndex: 200, boxShadow: "0 2px 20px rgba(0,0,0,.18)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px", display: "flex", alignItems: "center", height: 64, gap: 12 }}>
        <div
          onClick={() => { setView("home"); }}
          style={{ cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "flex-start", flexShrink: 0 }}
        >
          <div className="serif" style={{ fontSize: 22, fontStyle: "italic", color: BRAND.orange, lineHeight: 1, fontWeight: 700 }}>
            Maison Églantine
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,.65)", letterSpacing: 1.5, textTransform: "uppercase", marginTop: 2 }}>
            Pâtes fraîches artisanales
          </div>
        </div>
        <div style={{ flex: 1 }} />

        {isAdmin && (
          <button
            onClick={onLogout}
            style={{ background: "rgba(255,255,255,.18)", color: "#fff", borderRadius: 10, padding: "8px 14px", fontSize: 13, fontWeight: 600 }}
            className="hide-desktop"
          >
            ⏻ Déconnexion
          </button>
        )}

        {!isAdmin && (
          <div className="hide-mobile" style={{ display: "flex", gap: 4 }}>
            {[["home", "Accueil"], ["shop", "Boutique"], ["about", "À propos"], ["faq", "FAQ"], ["contact", "Contact"]].map(([v, l]) => (
              <button
                key={v}
                onClick={() => setView(v)}
                style={{ background: view === v ? BRAND.orange : "transparent", color: "#fff", padding: "7px 16px", borderRadius: 8, fontWeight: 500, fontSize: 14, transition: "background .2s" }}
              >
                {l}
              </button>
            ))}
          </div>
        )}

        {isAdmin && (
          <div className="hide-mobile" style={{ display: "flex", gap: 4 }}>
            <span style={{ color: "rgba(255,255,255,.5)", fontSize: 13, display: "flex", alignItems: "center", marginRight: 8 }}>⚙️ Administration</span>
            <button
              onClick={() => setView("dashboard")}
              style={{ background: view === "dashboard" ? BRAND.orange : "transparent", color: "#fff", padding: "7px 16px", borderRadius: 8, fontWeight: 500, fontSize: 14, transition: "background .2s" }}
            >
              Dashboard
            </button>
            <button
              onClick={onLogout}
              style={{ background: "rgba(255,255,255,.18)", color: "#fff", padding: "7px 16px", borderRadius: 8, fontWeight: 500, fontSize: 14 }}
            >
              Déconnexion
            </button>
          </div>
        )}

        {!isAdmin && (
          <button
            onClick={() => setView("cart")}
            style={{ background: view === "cart" ? BRAND.orange : "rgba(255,255,255,.18)", color: "#fff", borderRadius: 10, padding: "8px 16px", fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 8, position: "relative" }}
          >
            🛒 Panier
            {cartCount > 0 && (
              <span style={{ background: "#FF3B30", borderRadius: "50%", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, minWidth: 20 }}>
                {cartCount}
              </span>
            )}
          </button>
        )}

        {!isAdmin && (
          <button onClick={() => setMenuOpen((o) => !o)} style={{ background: "transparent", color: "#fff", fontSize: 22, display: "flex" }} className="hide-desktop">☰</button>
        )}
      </div>

      {menuOpen && !isAdmin && (
        <div className="slideIn" style={{ background: BRAND.tealDark, padding: "12px 16px", display: "flex", flexDirection: "column", gap: 4 }}>
          {[["home", "🏠 Accueil"], ["shop", "🍝 Boutique"], ["about", "ℹ️ À propos"], ["faq", "❓ FAQ"], ["contact", "📞 Contact"]].map(([v, l]) => (
            <button
              key={v}
              onClick={() => { setView(v); setMenuOpen(false); }}
              style={{ background: view === v ? BRAND.orange : "transparent", color: "#fff", padding: "11px 16px", borderRadius: 8, textAlign: "left", fontSize: 15, fontWeight: view === v ? 700 : 400 }}
            >
              {l}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
}

function HeroBanner({ setView }: { setView: (v: string) => void }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <section style={{ position: "relative", minHeight: "90vh", display: "flex", flexDirection: "column", justifyContent: "center", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(10,61,64,.90) 0%, rgba(14,122,128,.74) 50%, rgba(26,26,46,.85) 100%)", zIndex: 1 }} />
      <img
        src={HERO_BG}
        alt=""
        onLoad={() => setLoaded(true)}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", zIndex: 0, filter: "saturate(1.1)", transition: "opacity .8s", opacity: loaded ? 1 : 0 }}
      />
      <div className="hide-mobile bannerIn" style={{ position: "absolute", top: 28, right: 36, zIndex: 2, animationDelay: ".5s" }}>
        <ArtisanSeal size={104} />
      </div>

      <div style={{ position: "relative", zIndex: 2, maxWidth: 760, margin: "0 auto", padding: "80px 24px 60px", textAlign: "center" }}>
        <div className="bannerIn" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,.12)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,.3)", borderRadius: 30, padding: "7px 20px", marginBottom: 28, color: "rgba(255,255,255,.9)", fontSize: 13, fontWeight: 600, letterSpacing: .5 }}>
          🌟 Artisanat algérois depuis 2023
        </div>
        <div className="bannerIn" style={{ animationDelay: ".1s" }}>
          <h1 className="serif hero-headline" style={{ fontSize: "clamp(44px,8vw,80px)", fontStyle: "italic", color: "#fff", lineHeight: 1.05, marginBottom: 10, fontWeight: 700, textShadow: "0 4px 32px rgba(0,0,0,.3)" }}>
            Maison Églantine
          </h1>
          <div style={{ width: 80, height: 3, background: BRAND.orange, margin: "16px auto", borderRadius: 2 }} />
          <p style={{ fontSize: "clamp(16px,2.5vw,22px)", color: "rgba(255,255,255,.92)", fontWeight: 300, letterSpacing: .5, marginBottom: 8 }}>
            Pâtes fraîches artisanales
          </p>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,.68)", marginBottom: 6, maxWidth: 480, marginLeft: "auto", marginRight: "auto" }}>
            Trois mots guident chaque geste de notre atelier : l'<strong style={{ color: "#fff" }}>artisanat</strong>, la <strong style={{ color: "#fff" }}>fraîcheur</strong> et la <strong style={{ color: "#fff" }}>qualité</strong>.
          </p>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,.55)", marginBottom: 40 }}>
            Pétries à la main · Sans conservateurs · Livrées chez vous · Alger
          </p>
        </div>
        <div className="bannerIn" style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", animationDelay: ".22s" }}>
          <button onClick={() => setView("shop")} className="btn-primary" style={{ padding: "15px 36px", fontSize: 16 }}>
            Commander maintenant →
          </button>
          <button onClick={() => setView("about")} className="btn-ghost" style={{ padding: "15px 32px", fontSize: 15 }}>
            Notre histoire
          </button>
        </div>
        <div className="bannerIn" style={{ marginTop: 44, display: "flex", gap: 32, justifyContent: "center", flexWrap: "wrap", animationDelay: ".35s" }}>
          {[["⭐ 4.9/5", "300+ avis"], ["🚚 Livraison", "Alger & banlieue"], ["🥚 Fraîcheur", "Préparées à la commande"]].map(([t, s]) => (
            <div key={t} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>{t}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,.65)", marginTop: 2 }}>{s}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="float" style={{ position: "absolute", bottom: 24, left: "50%", transform: "translateX(-50%)", zIndex: 2, color: "rgba(255,255,255,.5)", fontSize: 22 }}>↓</div>
    </section>
  );
}

function ValuesSection() {
  const values = [
    { key: "artisanat", title: "L'artisanat", text: "Chaque paquet est pétri, étiré et coupé à la main dans notre atelier. Aucune machine industrielle : le geste reste celui d'une artisane, jour après jour.", img: "https://images.pexels.com/photos/6287316/pexels-photo-6287316.jpeg?auto=compress&cs=tinysrgb&h=650&w=940" },
    { key: "fraicheur", title: "La fraîcheur", text: "Nous préparons à la commande, jamais à l'avance. Pas de congélation, pas de longue conservation — juste des pâtes qui sortent de l'atelier pour aller chez vous.", img: "https://images.pexels.com/photos/5604812/pexels-photo-5604812.jpeg?auto=compress&cs=tinysrgb&h=650&w=940" },
    { key: "qualite", title: "La qualité", text: "Semoule de blé sélectionnée, œufs frais du marché, huile d'olive et farces préparées maison. Rien d'industriel n'entre dans nos recettes.", img: "https://images.pexels.com/photos/36999963/pexels-photo-36999963.jpeg?auto=compress&cs=tinysrgb&h=650&w=940" },
  ];
  return (
    <section style={{ maxWidth: 1180, margin: "0 auto", padding: "76px 24px 48px" }}>
      <div style={{ textAlign: "center", marginBottom: 44 }}>
        <span className="eyebrow">Nos valeurs</span>
        <h2 className="serif" style={{ fontSize: "clamp(26px,4vw,42px)", color: BRAND.dark, marginTop: 10, fontStyle: "italic" }}>Ce qui fait Maison Églantine</h2>
        <p style={{ color: BRAND.warmGrey, fontSize: 14, marginTop: 10, maxWidth: 520, marginLeft: "auto", marginRight: "auto" }}>
          Trois engagements simples, tenus à chaque commande.
        </p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 24 }}>
        {values.map((v, i) => (
          <div key={v.key} className="value-card fadeIn" style={{ animationDelay: `${i * .08}s` }}>
            <img src={v.img} alt={v.title} className="card-img" />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,61,64,.92) 0%, rgba(10,61,64,.25) 55%, rgba(10,61,64,.05) 100%)" }} />
            <div className="value-overlay">
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: BRAND.gold, textTransform: "uppercase" }}>0{i + 1}</span>
              <h3 className="serif" style={{ fontSize: 22, fontStyle: "italic", color: "#fff", margin: "6px 0 10px" }}>{v.title}</h3>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,.85)", lineHeight: 1.7 }}>{v.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function MiniProductCard({ p, setView }: { p: Product; setView: (v: string) => void }) {
  return (
    <div className="card" style={{ cursor: "default" }}>
      <div style={{ position: "relative", height: 190, overflow: "hidden" }}>
        <img src={p.image_url} alt={p.name} className="card-img" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,.3) 0%, transparent 60%)" }} />
        {p.badge && <span className={`product-badge ${getBadgeClass(p.badge)}`}>{p.badge}</span>}
      </div>
      <div style={{ padding: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
          <Stars n={5} size={12} />
          <span style={{ fontSize: 11, color: BRAND.warmGrey }}>({p.reviews})</span>
        </div>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: BRAND.dark, marginBottom: 4 }}>{p.name}</h3>
        <p style={{ fontSize: 12, color: BRAND.warmGrey, marginBottom: 14, lineHeight: 1.5 }}>{p.description}</p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 20, fontWeight: 800, color: BRAND.orange }}>{fmt(p.price)}</span>
          <button onClick={() => setView("shop")} style={{ background: BRAND.teal, color: "#fff", padding: "8px 16px", borderRadius: 20, fontWeight: 600, fontSize: 13, transition: "background .2s" }}>
            Voir →
          </button>
        </div>
      </div>
    </div>
  );
}

export function HomePage({ setView, products }: { setView: (v: string) => void; products: Product[] }) {
  const bestsellers = useMemo(() => products.filter((p) => p.active && p.badge === "Bestseller").slice(0, 3), [products]);
  const [timeLeft, setTimeLeft] = useState({ h: 2, m: 47, s: 13 });

  useEffect(() => {
    const t = setInterval(() => {
      setTimeLeft((prev) => {
        let { h, m, s } = prev;
        s--;
        if (s < 0) { s = 59; m--; }
        if (m < 0) { m = 59; h--; }
        if (h < 0) { h = 2; m = 59; s = 59; }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div>
      <HeroBanner setView={setView} />
      <TrustBar />

      <div style={{ background: "#FFF8E1", borderBottom: `2px solid ${BRAND.gold}`, padding: "14px 24px", textAlign: "center" }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: "#7B5B00" }}>
          ⏱️ Commandez avant 18h pour une livraison aujourd'hui ·
          <span style={{ background: BRAND.dark, color: "#fff", borderRadius: 6, padding: "2px 10px", marginLeft: 10, fontFamily: "monospace", fontSize: 13 }}>
            {String(timeLeft.h).padStart(2, "0")}:{String(timeLeft.m).padStart(2, "0")}:{String(timeLeft.s).padStart(2, "0")}
          </span>
        </p>
      </div>

      <ValuesSection />

      {bestsellers.length > 0 && (
        <section style={{ background: "#fff", padding: "72px 24px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <span className="eyebrow">Les favoris</span>
              <h2 className="serif" style={{ fontSize: "clamp(26px,4vw,40px)", color: BRAND.dark, marginTop: 10, fontStyle: "italic" }}>Nos bestsellers</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 24 }}>
              {bestsellers.map((p) => (
                <MiniProductCard key={p.id} p={p} setView={setView} />
              ))}
            </div>
            <div style={{ textAlign: "center", marginTop: 40 }}>
              <button onClick={() => setView("shop")} className="btn-primary" style={{ padding: "13px 36px", fontSize: 15 }}>
                Voir toute la boutique →
              </button>
            </div>
          </div>
        </section>
      )}

      <section style={{ background: BRAND.cream, padding: "72px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <span className="eyebrow">Avis clients</span>
            <h2 className="serif" style={{ fontSize: "clamp(26px,4vw,38px)", color: BRAND.dark, marginTop: 10, fontStyle: "italic" }}>Ils nous font confiance</h2>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginTop: 16 }}>
              <Stars n={5} size={20} />
              <span style={{ fontWeight: 800, fontSize: 22, color: BRAND.dark }}>4.9</span>
              <span style={{ color: BRAND.warmGrey, fontSize: 14 }}>· 300+ avis vérifiés</span>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 20 }}>
            {[
              { name: "Nadia K.", q: "Les meilleures pâtes fraîches d'Alger ! Mes enfants en redemandent chaque semaine.", stars: 5, date: "Il y a 2 jours" },
              { name: "Rachid M.", q: "Qualité exceptionnelle, livraison rapide. Les raviolis épinards-ricotta sont divins.", stars: 5, date: "Il y a 1 semaine" },
              { name: "Sihem B.", q: "Coffret cadeau parfait pour offrir. Présentation soignée, pâtes délicieuses !", stars: 5, date: "Il y a 10 jours" },
            ].map((r) => (
              <div key={r.name} style={{ background: "#fff", borderRadius: 18, padding: 24, boxShadow: "0 2px 16px rgba(0,0,0,.06)" }}>
                <Stars n={r.stars} size={14} />
                <p style={{ fontSize: 14, color: BRAND.dark, lineHeight: 1.7, margin: "12px 0 16px", fontStyle: "italic" }}>"{r.q}"</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 700, fontSize: 13, color: BRAND.teal }}>— {r.name}</span>
                  <span style={{ fontSize: 11, color: BRAND.warmGrey }}>{r.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background: `linear-gradient(135deg, ${BRAND.orange} 0%, ${BRAND.orangeDark} 100%)`, color: "#fff", padding: "72px 24px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "relative" }}>
          <h2 className="serif" style={{ fontSize: "clamp(24px,4vw,40px)", fontStyle: "italic", marginBottom: 14 }}>Prêt à vous régaler ?</h2>
          <p style={{ fontSize: 16, opacity: .9, marginBottom: 32, maxWidth: 520, margin: "0 auto 32px" }}>Commandez vos pâtes fraîches artisanales en quelques clics. Livraison rapide sur Alger.</p>
          <button onClick={() => setView("shop")} style={{ background: "#fff", color: BRAND.orange, padding: "15px 40px", borderRadius: 30, fontWeight: 800, fontSize: 16, boxShadow: "0 8px 32px rgba(0,0,0,.15)", transition: "transform .2s" }}>
            Commander maintenant →
          </button>
        </div>
      </section>

      <section style={{ background: BRAND.dark, color: "#fff", padding: "48px 24px", textAlign: "center" }}>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,.5)", marginBottom: 8, letterSpacing: 1, textTransform: "uppercase" }}>Suivez-nous</p>
        <a href="https://instagram.com/maison_eglantine16" target="_blank" rel="noreferrer" style={{ fontSize: 24, fontWeight: 700, color: BRAND.orange, display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
          📸 @maison_eglantine16
        </a>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,.4)", marginTop: 8 }}>Partagez vos créations · Taguez-nous !</p>
      </section>

      <footer style={{ background: "#111", color: "rgba(255,255,255,.5)", padding: "32px 24px", textAlign: "center", fontSize: 13 }}>
        <div className="serif" style={{ color: BRAND.orange, fontSize: 22, fontStyle: "italic", marginBottom: 10 }}>Maison Églantine</div>
        <p>📞 0661 997 537 · 📸 @maison_eglantine16 · 📍 Alger</p>
        <p style={{ marginTop: 8, opacity: .4 }}>© 2026 Maison Églantine · Pâtes fraîches artisanales · Tous droits réservés</p>
      </footer>
    </div>
  );
}

export function ShopPage({
  products,
  categories,
  cart,
  setCart,
}: {
  products: Product[];
  categories: Category[];
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
}) {
  const [activeCat, setActiveCat] = useState(0);
  const [search, setSearch] = useState("");
  const [added, setAdded] = useState<number | null>(null);
  const [sort, setSort] = useState("default");

  let visible = products.filter(
    (p) =>
      p.active &&
      (activeCat === 0 || p.category_id === activeCat) &&
      p.name.toLowerCase().includes(search.toLowerCase())
  );

  if (sort === "price-asc") visible = [...visible].sort((a, b) => a.price - b.price);
  if (sort === "price-desc") visible = [...visible].sort((a, b) => b.price - a.price);
  if (sort === "popular") visible = [...visible].sort((a, b) => b.reviews - a.reviews);

  const addToCart = (p: Product) => {
    setCart((c) => {
      const ex = c.find((i) => i.id === p.id);
      return ex ? c.map((i) => (i.id === p.id ? { ...i, qty: i.qty + 1 } : i)) : [...c, { id: p.id, name: p.name, price: p.price, qty: 1, image_url: p.image_url, emoji: p.emoji, unit: p.unit }];
    });
    setAdded(p.id);
    setTimeout(() => setAdded(null), 1400);
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px" }}>
      <div style={{ marginBottom: 32 }}>
        <span className="eyebrow">Notre boutique</span>
        <h2 className="serif" style={{ fontSize: "clamp(26px,4vw,38px)", color: BRAND.dark, marginTop: 6, fontStyle: "italic" }}>Pâtes fraîches artisanales</h2>
        <p style={{ color: BRAND.warmGrey, fontSize: 14, marginTop: 4 }}>Préparées à la commande · Livraison sur Alger · Paiement à la réception</p>
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 24 }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 Rechercher..."
          style={{ flex: 1, minWidth: 200, maxWidth: 320, padding: "10px 18px", borderRadius: 30, border: `1.5px solid ${BRAND.teal}44`, fontSize: 14, background: "#fff", outline: "none" }}
        />
        <select value={sort} onChange={(e) => setSort(e.target.value)} style={{ padding: "10px 16px", borderRadius: 12, border: `1.5px solid ${BRAND.teal}44`, fontSize: 13, background: "#fff", cursor: "pointer" }}>
          <option value="default">Trier par défaut</option>
          <option value="popular">Les + populaires</option>
          <option value="price-asc">Prix croissant</option>
          <option value="price-desc">Prix décroissant</option>
        </select>
        <span style={{ fontSize: 13, color: BRAND.warmGrey }}>{visible.length} produit{visible.length !== 1 ? "s" : ""}</span>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 32 }}>
        <button onClick={() => setActiveCat(0)} style={{ padding: "8px 20px", borderRadius: 30, fontWeight: 600, fontSize: 13, background: activeCat === 0 ? BRAND.teal : "#fff", color: activeCat === 0 ? "#fff" : BRAND.teal, border: `1.5px solid ${BRAND.teal}55`, transition: "all .2s" }}>
          Tout
        </button>
        {categories.map((c) => (
          <button key={c.id} onClick={() => setActiveCat(c.id)} style={{ padding: "8px 20px", borderRadius: 30, fontWeight: 600, fontSize: 13, background: activeCat === c.id ? BRAND.teal : "#fff", color: activeCat === c.id ? "#fff" : BRAND.teal, border: `1.5px solid ${BRAND.teal}55`, transition: "all .2s" }}>
            {c.name}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(268px,1fr))", gap: 26 }}>
        {visible.map((p, idx) => (
          <div key={p.id} className="fadeIn card" style={{ animationDelay: `${idx * .04}s`, display: "flex", flexDirection: "column" }}>
            <div style={{ position: "relative", height: 210, overflow: "hidden", background: BRAND.cream }}>
              <img src={p.image_url} alt={p.name} className="card-img" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,.15) 0%, transparent 50%)" }} />
              {p.badge && <span className={`product-badge ${getBadgeClass(p.badge)}`}>{p.badge}</span>}
              {p.stock <= p.low_stock_alert && p.stock > 0 && (
                <span style={{ position: "absolute", top: 12, right: 12, background: "rgba(0,0,0,.72)", color: "#fff", fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20 }}>
                  Plus que {p.stock} !
                </span>
              )}
            </div>
            <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                <Stars n={5} size={12} />
                <span style={{ fontSize: 11, color: BRAND.warmGrey }}>({p.reviews || 0} avis)</span>
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: BRAND.dark, marginBottom: 5, lineHeight: 1.3 }}>{p.name}</h3>
              <p style={{ fontSize: 12, color: BRAND.warmGrey, lineHeight: 1.6, marginBottom: 8 }}>{p.description}</p>
              <p style={{ fontSize: 12, color: BRAND.teal, fontWeight: 600, marginBottom: "auto", paddingBottom: 14 }}>📦 {p.unit}</p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 14, borderTop: `1px solid ${BRAND.cream}` }}>
                <span style={{ fontSize: 20, fontWeight: 800, color: BRAND.orange }}>{fmt(p.price)}</span>
                <button
                  onClick={() => addToCart(p)}
                  disabled={p.stock === 0}
                  style={{
                    background: added === p.id ? BRAND.green : p.stock === 0 ? "#ddd" : BRAND.orange,
                    color: "#fff",
                    padding: "9px 18px",
                    borderRadius: 30,
                    fontWeight: 700,
                    fontSize: 13,
                    transition: "all .25s",
                    cursor: p.stock === 0 ? "not-allowed" : "pointer",
                    boxShadow: added === p.id || p.stock === 0 ? "none" : `0 4px 14px ${BRAND.orange}44`,
                  }}
                >
                  {added === p.id ? "✓ Ajouté !" : p.stock === 0 ? "Épuisé" : "+ Ajouter"}
                </button>
              </div>
            </div>
          </div>
        ))}
        {visible.length === 0 && (
          <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "60px 0", color: BRAND.warmGrey }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
            <p style={{ fontSize: 16 }}>Aucun produit trouvé</p>
          </div>
        )}
      </div>

      <div style={{ marginTop: 64, background: "#fff", borderRadius: 20, padding: 32, display: "flex", gap: 32, flexWrap: "wrap", justifyContent: "center", boxShadow: "0 2px 16px rgba(0,0,0,.06)" }}>
        {[["🔒", "Paiement sécurisé", "À la livraison, sans risque"], ["🚚", "Livraison rapide", "Alger & banlieue"], ["↩️", "Satisfait ou remboursé", "Qualité garantie"], ["📞", "Support dédié", "0661 997 537"]].map(([e, t, d]) => (
          <div key={t} style={{ textAlign: "center", minWidth: 160 }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{e}</div>
            <div style={{ fontWeight: 700, fontSize: 14, color: BRAND.dark }}>{t}</div>
            <div style={{ fontSize: 12, color: BRAND.warmGrey, marginTop: 3 }}>{d}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CartPage({
  cart,
  setCart,
  setView,
  deliveryZones,
  products,
  onOrderPlaced,
}: {
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  setView: (v: string) => void;
  deliveryZones: DeliveryZone[];
  products: Product[];
  onOrderPlaced: () => void;
}) {
  const [form, setForm] = useState({ name: "", phone: "", address: "", zone: "", notes: "" });
  const [step, setStep] = useState(1);
  const [orderDone, setOrderDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastOrder, setLastOrder] = useState<{
    orderNumber: number;
    items: CartItem[];
    subtotal: number;
    deliveryFee: number;
    total: number;
    name: string;
    phone: string;
    address: string;
    zone: string;
  } | null>(null);

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const zone = deliveryZones.find((z) => z.name === form.zone);
  const delivFee = zone ? zone.price : 0;
  const grand = total + delivFee;

  const upd = (id: number, qty: number) => {
    if (qty < 1) setCart((c) => c.filter((i) => i.id !== id));
    else setCart((c) => c.map((i) => (i.id === id ? { ...i, qty } : i)));
  };

  const placeOrder = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const { data: orderData, error: orderErr } = await supabase.rpc("create_order", {
        p_client_name: form.name,
        p_client_phone: form.phone,
        p_client_address: form.address,
        p_zone: form.zone,
        p_notes: form.notes,
        p_items: cart.map((i) => ({ product_id: i.id, qty: i.qty })),
      });

      if (orderErr) throw orderErr;
      if (!orderData) throw new Error("Impossible de créer la commande");

      setLastOrder({
        orderNumber: orderData.order_number as number,
        items: [...cart],
        subtotal: total,
        deliveryFee: delivFee,
        total: orderData.total as number,
        name: form.name,
        phone: form.phone,
        address: form.address,
        zone: form.zone,
      });
      setOrderDone(true);
      setCart([]);
      setStep(3);
      onOrderPlaced();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setSubmitting(false);
    }
  };

  const cartIds = new Set(cart.map((i) => i.id));
  const upsell = products.filter((p) => p.active && !cartIds.has(p.id) && p.category_id === 4).slice(0, 2);

  if (orderDone && lastOrder) {
    return (
      <div style={{ maxWidth: 560, margin: "60px auto", padding: "0 24px" }} className="fadeIn">
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ fontSize: 72, marginBottom: 16 }}>✅</div>
          <h2 className="serif" style={{ fontSize: 30, color: BRAND.teal, marginBottom: 12, fontStyle: "italic" }}>Commande confirmée !</h2>
          <p style={{ color: BRAND.warmGrey, lineHeight: 1.7 }}>
            Merci <strong style={{ color: BRAND.dark }}>{lastOrder.name}</strong>. Votre commande a bien été enregistrée.<br />
            Nous vous contacterons sous peu pour confirmation.
          </p>
        </div>

        <div style={{ background: "#fff", borderRadius: 20, padding: "28px 24px", boxShadow: "0 4px 24px rgba(0,0,0,.08)", marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 16, borderBottom: `1px solid ${BRAND.cream}` }}>
            <span style={{ fontWeight: 700, color: BRAND.teal, fontSize: 14 }}>📋 Commande</span>
            <span style={{ fontWeight: 800, color: BRAND.dark, fontSize: 16 }}>#{lastOrder.orderNumber}</span>
          </div>

          <div style={{ paddingTop: 16 }}>
            <p style={{ fontWeight: 700, fontSize: 13, color: BRAND.warmGrey, marginBottom: 10, textTransform: "uppercase", letterSpacing: .5 }}>Articles</p>
            {lastOrder.items.map((item) => (
              <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, fontSize: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 8, overflow: "hidden", flexShrink: 0, background: BRAND.cream }}>
                    <img src={item.image_url} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: BRAND.dark }}>{item.name}</div>
                    <div style={{ fontSize: 12, color: BRAND.warmGrey }}>x{item.qty}</div>
                  </div>
                </div>
                <span style={{ fontWeight: 700, color: BRAND.dark }}>{fmt(item.price * item.qty)}</span>
              </div>
            ))}
          </div>

          <div style={{ paddingTop: 16, borderTop: `1px solid ${BRAND.cream}`, marginTop: 4 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 14, color: BRAND.warmGrey }}>
              <span>Sous-total</span><span>{fmt(lastOrder.subtotal)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 14, color: BRAND.warmGrey }}>
              <span>Livraison ({lastOrder.zone})</span><span style={{ color: lastOrder.deliveryFee === 0 ? BRAND.green : BRAND.dark }}>{lastOrder.deliveryFee > 0 ? fmt(lastOrder.deliveryFee) : "Gratuite"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 18, borderTop: `1px solid ${BRAND.cream}`, paddingTop: 10, marginTop: 6 }}>
              <span>Total à payer</span><span style={{ color: BRAND.orange }}>{fmt(lastOrder.total)}</span>
            </div>
          </div>
        </div>

        <div style={{ background: BRAND.tealLight, borderRadius: 16, padding: "20px 24px", marginBottom: 20, fontSize: 14 }}>
          <p style={{ fontWeight: 700, color: BRAND.teal, marginBottom: 12 }}>📍 Livraison</p>
          <p style={{ color: BRAND.dark, marginBottom: 4 }}><strong>{lastOrder.name}</strong></p>
          <p style={{ color: BRAND.warmGrey, marginBottom: 4 }}>{lastOrder.phone}</p>
          {lastOrder.address && <p style={{ color: BRAND.warmGrey, marginBottom: 4 }}>{lastOrder.address}</p>}
          <p style={{ color: BRAND.warmGrey }}>{lastOrder.zone}</p>
        </div>

        <div style={{ background: BRAND.orangeLight, borderRadius: 16, padding: "16px 24px", marginBottom: 28, textAlign: "center" }}>
          <p style={{ fontWeight: 700, color: BRAND.orange, fontSize: 14 }}>💰 Paiement en espèces à la livraison</p>
        </div>

        <div style={{ textAlign: "center" }}>
          <button onClick={() => setView("shop")} className="btn-primary" style={{ padding: "13px 32px", fontSize: 15 }}>
            Continuer mes achats →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 24px" }}>
      <div style={{ display: "flex", gap: 0, marginBottom: 36, background: "#fff", borderRadius: 30, overflow: "hidden", border: `1.5px solid ${BRAND.teal}22` }}>
        {["🛒 Panier", "📋 Informations", "✅ Confirmation"].map((l, i) => (
          <div key={i} style={{ flex: 1, textAlign: "center", padding: "12px 8px", background: step === i + 1 ? BRAND.teal : "transparent", color: step === i + 1 ? "#fff" : BRAND.warmGrey, fontWeight: step === i + 1 ? 700 : 400, fontSize: 13, transition: "all .2s" }}>{l}</div>
        ))}
      </div>

      {step === 1 && (
        <>
          {cart.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>🛒</div>
              <p style={{ color: BRAND.warmGrey, fontSize: 16, marginBottom: 24 }}>Votre panier est vide</p>
              <button onClick={() => setView("shop")} className="btn-primary" style={{ padding: "12px 28px", fontSize: 15 }}>
                Voir la boutique →
              </button>
            </div>
          ) : (
            <>
              {cart.map((i) => (
                <div key={i.id} style={{ background: "#fff", borderRadius: 16, padding: "16px 20px", marginBottom: 12, display: "flex", alignItems: "center", gap: 16, boxShadow: "0 2px 12px rgba(0,0,0,.06)" }}>
                  <div style={{ width: 64, height: 64, borderRadius: 12, overflow: "hidden", flexShrink: 0, background: BRAND.cream }}>
                    <img src={i.image_url} alt={i.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 3 }}>{i.name}</div>
                    <div style={{ color: BRAND.orange, fontWeight: 700 }}>{fmt(i.price)}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <button onClick={() => upd(i.id, i.qty - 1)} style={{ background: BRAND.cream, border: `1.5px solid ${BRAND.teal}33`, borderRadius: 8, width: 32, height: 32, fontWeight: 700, fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                    <span style={{ fontWeight: 700, minWidth: 24, textAlign: "center", fontSize: 15 }}>{i.qty}</span>
                    <button onClick={() => upd(i.id, i.qty + 1)} style={{ background: BRAND.teal, color: "#fff", borderRadius: 8, width: 32, height: 32, fontWeight: 700, fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                  </div>
                  <button onClick={() => setCart((c) => c.filter((x) => x.id !== i.id))} style={{ background: "#FDEDEC", color: BRAND.red, borderRadius: 8, padding: "6px 10px", fontSize: 13 }}>✕</button>
                </div>
              ))}

              {upsell.length > 0 && (
                <div style={{ background: BRAND.orangeLight, borderRadius: 16, padding: "18px 20px", marginBottom: 16 }}>
                  <p style={{ fontWeight: 700, color: BRAND.orange, marginBottom: 14, fontSize: 14 }}>🍝 Accompagnez vos pâtes !</p>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    {upsell.map((p) => (
                      <div key={p.id} style={{ background: "#fff", borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 200, boxShadow: "0 1px 8px rgba(0,0,0,.06)" }}>
                        <span style={{ fontSize: 28 }}>{p.emoji}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: 13 }}>{p.name}</div>
                          <div style={{ color: BRAND.orange, fontWeight: 700, fontSize: 13 }}>{fmt(p.price)}</div>
                        </div>
                        <button
                          onClick={() => setCart((c) => { const ex = c.find((x) => x.id === p.id); return ex ? c.map((x) => x.id === p.id ? { ...x, qty: x.qty + 1 } : x) : [...c, { id: p.id, name: p.name, price: p.price, qty: 1, image_url: p.image_url, emoji: p.emoji, unit: p.unit }]; })}
                          style={{ background: BRAND.orange, color: "#fff", borderRadius: 20, padding: "6px 14px", fontWeight: 700, fontSize: 12 }}
                        >
                          + Ajouter
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ background: "#fff", borderRadius: 16, padding: "18px 20px", marginBottom: 6, boxShadow: "0 2px 12px rgba(0,0,0,.05)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 18 }}>
                  <span>Sous-total</span><span style={{ color: BRAND.orange }}>{fmt(total)}</span>
                </div>
                <p style={{ fontSize: 12, color: BRAND.warmGrey, marginTop: 6 }}>Frais de livraison calculés à l'étape suivante</p>
              </div>

              <button onClick={() => setStep(2)} className="btn-primary" style={{ marginTop: 20, width: "100%", padding: "15px", fontSize: 16 }}>
                Passer commande →
              </button>
              <p style={{ textAlign: "center", fontSize: 12, color: BRAND.warmGrey, marginTop: 12 }}>
                🔒 Paiement sécurisé à la livraison · Aucune carte requise
              </p>
            </>
          )}
        </>
      )}

      {step === 2 && (
        <>
          <div style={{ background: "#fff", borderRadius: 20, padding: "28px 24px", boxShadow: "0 2px 16px rgba(0,0,0,.07)", marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700, color: BRAND.teal, marginBottom: 20, fontSize: 16 }}>📋 Vos informations</h3>
            {[["name", "Votre nom complet", "text", "👤"], ["phone", "Votre numéro de téléphone", "tel", "📞"], ["address", "Votre adresse complète", "text", "📍"]].map(([k, lbl, t, ico]) => (
              <div key={k} style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: BRAND.dark, display: "block", marginBottom: 6 }}>{ico} {lbl} *</label>
                <input
                  type={t as string}
                  value={(form as Record<string, string>)[k as string]}
                  onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))}
                  style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: `1.5px solid ${(form as Record<string, string>)[k as string] ? BRAND.teal : BRAND.teal + "44"}`, fontSize: 14, outline: "none", transition: "border .2s" }}
                />
              </div>
            ))}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: BRAND.dark, display: "block", marginBottom: 6 }}>🗺️ Zone de livraison *</label>
              <select value={form.zone} onChange={(e) => setForm((f) => ({ ...f, zone: e.target.value }))} style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: `1.5px solid ${form.zone ? BRAND.teal : BRAND.teal + "44"}`, fontSize: 14, background: "#fff" }}>
                <option value="">-- Choisir votre zone --</option>
                {deliveryZones.map((z) => <option key={z.id} value={z.name}>{z.name} — {z.price > 0 ? `+${fmt(z.price)}` : "Gratuit"}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: BRAND.dark, display: "block", marginBottom: 6 }}>📝 Instructions (optionnel)</label>
              <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} rows={2} placeholder="Ex : couleur des pâtes, code d'entrée, étage..." style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: `1.5px solid ${BRAND.teal}44`, fontSize: 14, resize: "vertical" }} />
            </div>
          </div>

          <div style={{ background: "#fff", borderRadius: 16, padding: "18px 20px", marginBottom: 20, boxShadow: "0 2px 12px rgba(0,0,0,.05)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 14, color: BRAND.warmGrey }}>
              <span>Sous-total</span><span>{fmt(total)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 14, color: BRAND.warmGrey }}>
              <span>Livraison</span><span style={{ color: delivFee === 0 ? BRAND.green : BRAND.dark }}>{delivFee > 0 ? fmt(delivFee) : "Gratuite"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 20, borderTop: `1px solid ${BRAND.cream}`, paddingTop: 12, marginTop: 8 }}>
              <span>Total</span><span style={{ color: BRAND.orange }}>{fmt(grand)}</span>
            </div>
            <div style={{ marginTop: 12, background: BRAND.tealLight, borderRadius: 10, padding: "10px 14px", fontSize: 13, color: BRAND.teal, fontWeight: 600 }}>
              💰 Paiement en espèces à la livraison
            </div>
          </div>

          {error && (
            <div style={{ background: "#FDEDEC", color: BRAND.red, borderRadius: 12, padding: "12px 16px", marginBottom: 16, fontSize: 14, fontWeight: 600 }}>
              ⚠️ {error}
            </div>
          )}

          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={() => setStep(1)} style={{ flex: 1, background: BRAND.cream, color: BRAND.dark, padding: "13px", borderRadius: 30, fontWeight: 600, border: `1.5px solid ${BRAND.teal}33` }}>← Retour</button>
            <button
              onClick={placeOrder}
              disabled={!form.name || !form.phone || !form.zone || submitting}
              className="btn-primary"
              style={{ flex: 2, padding: "13px", fontSize: 15, opacity: !form.name || !form.phone || !form.zone || submitting ? .5 : 1, cursor: !form.name || !form.phone || !form.zone || submitting ? "not-allowed" : "pointer" }}
            >
              {submitting ? "Envoi en cours..." : "✓ Confirmer la commande"}
            </button>
          </div>
          <p style={{ textAlign: "center", fontSize: 12, color: BRAND.warmGrey, marginTop: 14 }}>
            🔒 Vos données sont protégées et ne seront jamais revendues
          </p>
        </>
      )}
    </div>
  );
}

export function AboutPage() {
  return (
    <div>
      <div style={{ position: "relative", padding: "88px 24px 76px", textAlign: "center", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(135deg, ${BRAND.tealInk}, ${BRAND.tealDark})` }} />
        <div style={{ position: "relative", color: "#fff" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
            <ArtisanSeal size={92} spin={false} />
          </div>
          <h2 className="serif" style={{ fontSize: "clamp(30px,5vw,52px)", fontStyle: "italic", marginBottom: 12 }}>Notre Histoire</h2>
          <p style={{ opacity: .85, fontSize: 16, maxWidth: 560, margin: "0 auto" }}>La passion d'une artisane algéroise pour les vraies pâtes fraîches</p>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "64px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr .9fr", gap: 40, alignItems: "center", marginBottom: 56 }}>
          <div>
            <span className="eyebrow">Depuis 2023</span>
            <h3 className="serif" style={{ fontSize: "clamp(22px,3vw,30px)", fontStyle: "italic", color: BRAND.dark, margin: "10px 0 18px" }}>Un geste, pas une chaîne de production</h3>
            <p style={{ fontSize: 15, lineHeight: 1.85, color: BRAND.warmGrey, marginBottom: 16 }}>
              <strong style={{ color: BRAND.orange }}>Maison Églantine</strong> est née de la passion d'une artisane algéroise pour les vraies pâtes fraîches — celles qui se pètrissent à la main, qui s'étirent avec soin et qui se cuisent en 3 à 5 minutes.
            </p>
            <p style={{ fontSize: 15, lineHeight: 1.85, color: BRAND.warmGrey }}>
              Chaque gramme est préparé avec des œufs frais, de la semoule de blé sélectionnée et de l'huile d'olive. Nos pâtes peuvent être colorées naturellement : betterave pour le rose-rouge, épinards pour le vert, paprika doux pour l'orange, encre de seiche pour le noir.
            </p>
          </div>
          <div style={{ borderRadius: 22, overflow: "hidden", boxShadow: "0 16px 48px rgba(10,61,64,.18)", aspectRatio: "4/5" }}>
            <img src="https://images.pexels.com/photos/4699966/pexels-photo-4699966.jpeg?auto=compress&cs=tinysrgb&h=650&w=940" alt="Pâtes fraîches artisanales" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: ".9fr 1.1fr", gap: 40, alignItems: "center", marginBottom: 56 }}>
          <div className="hide-mobile" style={{ borderRadius: 22, overflow: "hidden", boxShadow: "0 16px 48px rgba(10,61,64,.18)", aspectRatio: "4/5" }}>
            <img src="https://images.pexels.com/photos/5604824/pexels-photo-5604824.jpeg?auto=compress&cs=tinysrgb&h=650&w=940" alt="Sauces et condiments faits maison" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div>
            <span className="eyebrow">Autour des pâtes</span>
            <h3 className="serif" style={{ fontSize: "clamp(22px,3vw,30px)", fontStyle: "italic", color: BRAND.dark, margin: "10px 0 18px" }}>Sauces, raviolis et coffrets</h3>
            <p style={{ fontSize: 15, lineHeight: 1.85, color: BRAND.warmGrey }}>
              Nous proposons également des sauces maison, des raviolis farcis et des coffrets cadeaux pour les occasions spéciales — pensés pour prolonger le même soin artisanal jusque dans votre assiette.
            </p>
          </div>
        </div>

        <div style={{ background: "#fff", borderRadius: 20, padding: "32px 36px", boxShadow: "0 4px 32px rgba(0,0,0,.08)" }}>
          <div style={{ background: BRAND.tealLight, borderRadius: 14, padding: "24px 28px" }}>
            <p style={{ fontWeight: 700, color: BRAND.teal, marginBottom: 12, fontSize: 16 }}>📍 Informations pratiques</p>
            {[["📞", "0661 997 537"], ["📸", "Instagram : @maison_eglantine16"], ["🕐", "Disponibles tous les jours"], ["📦", "Paquets de 320g · 3 à 4 parts"], ["⏱️", "Cuisson : 3 à 5 minutes"]].map(([e, t]) => (
              <p key={t} style={{ marginBottom: 6, fontSize: 14 }}>{e} {t}</p>
            ))}
            <p style={{ fontSize: 12, color: BRAND.warmGrey, marginTop: 10 }}>Produit frais à consommer de préférence dans les 7 jours.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FaqPage() {
  const [open, setOpen] = useState<number | null>(null);
  const items = [
    ["Comment passer commande ?", "Ajoutez vos produits au panier, puis cliquez sur « Passer commande ». Renseignez vos coordonnées, choisissez votre zone de livraison et confirmez. Nous vous contactons pour valider."],
    ["Quel est le délai de livraison ?", "La livraison se fait généralement le jour même ou le lendemain. Nous vous confirmons le créneau par téléphone."],
    ["Comment se passe le paiement ?", "Le paiement s'effectue en espèces à la livraison. Aucune carte requise."],
    ["Les pâtes peuvent-elles être colorées ?", "Oui ! Betterave (rose/rouge), épinards (vert), paprika doux (orange), encre de seiche (noir). Précisez dans les instructions."],
    ["Combien de temps se conservent les pâtes ?", "7 jours au réfrigérateur. Cuisson : 3 à 5 minutes."],
    ["Proposez-vous le retrait en boutique ?", "Oui, choisissez « Retrait en boutique » lors de la commande."],
    ["Y a-t-il une commande minimum ?", "Non, aucun minimum. Chaque paquet fait 320g pour 3 à 4 parts."],
  ];
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "60px 24px" }}>
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <span className="eyebrow">FAQ</span>
        <h2 className="serif" style={{ fontSize: "clamp(26px,4vw,38px)", color: BRAND.dark, marginTop: 8, fontStyle: "italic" }}>Questions fréquentes</h2>
      </div>
      {items.map(([q, a], i) => (
        <div key={i} style={{ background: "#fff", borderRadius: 14, marginBottom: 10, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,.05)", border: `1.5px solid ${open === i ? BRAND.teal + "44" : "transparent"}`, transition: "border .2s" }}>
          <button onClick={() => setOpen(open === i ? null : i)} style={{ width: "100%", padding: "18px 22px", textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center", background: "none", fontWeight: 600, fontSize: 14, color: BRAND.dark }}>
            {q}<span style={{ color: BRAND.teal, fontSize: 20, fontWeight: 300 }}>{open === i ? "−" : "+"}</span>
          </button>
          {open === i && <div className="fadeIn" style={{ padding: "0 22px 18px", fontSize: 14, color: BRAND.warmGrey, lineHeight: 1.8 }}>{a}</div>}
        </div>
      ))}
    </div>
  );
}

export function ContactPage({ siteInfo }: { siteInfo: SiteSettings | null }) {
  const info = siteInfo || { id: 1, phone: "0661 997 537", instagram: "@maison_eglantine16", address: "Alger, Algérie", hours: "Tous les jours – commandez en ligne" };
  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "60px 24px" }}>
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <span className="eyebrow">Contact</span>
        <h2 className="serif" style={{ fontSize: "clamp(26px,4vw,38px)", color: BRAND.dark, marginTop: 8, fontStyle: "italic" }}>Nous contacter</h2>
      </div>
      {[
        ["📞", "Téléphone", info.phone, `tel:${info.phone.replace(/ /g, "")}`],
        ["📸", "Instagram", info.instagram, `https://instagram.com/${info.instagram.replace("@", "")}`],
        ["📍", "Adresse", info.address, null],
        ["🕐", "Horaires", info.hours, null],
      ].map(([e, l, v, href]) => (
        <div key={l as string} style={{ background: "#fff", borderRadius: 16, padding: "22px 26px", marginBottom: 12, display: "flex", alignItems: "center", gap: 20, boxShadow: "0 2px 16px rgba(0,0,0,.06)" }}>
          <div style={{ fontSize: 32, width: 48, textAlign: "center" }}>{e as string}</div>
          <div>
            <div style={{ fontSize: 12, color: BRAND.warmGrey, marginBottom: 4, textTransform: "uppercase", letterSpacing: .8 }}>{l as string}</div>
            {href ? <a href={href as string} style={{ fontWeight: 700, color: BRAND.teal, fontSize: 16 }}>{v as string}</a> : <div style={{ fontWeight: 700, color: BRAND.dark, fontSize: 15 }}>{v as string}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}
