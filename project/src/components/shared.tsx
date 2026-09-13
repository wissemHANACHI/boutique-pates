import { useState, useEffect } from "react";

export const BRAND = {
  teal: "#0E7A80",
  tealDark: "#075F63",
  tealInk: "#0A3D40",
  tealLight: "#E8F4F5",
  orange: "#E8843A",
  orangeDark: "#C96A28",
  orangeLight: "#FFF3EB",
  cream: "#FDF6EE",
  creamDark: "#F3E7D6",
  paper: "#FFFDF9",
  warmGrey: "#7A6E65",
  dark: "#1A1A2E",
  red: "#C0392B",
  green: "#27AE60",
  gold: "#D4AF37",
} as const;

export const ORDER_STATUSES = [
  "Nouvelle",
  "Confirmée",
  "En préparation",
  "Prête",
  "En livraison",
  "Livrée",
  "Annulée",
] as const;

export const fmt = (n: number) => n.toLocaleString("fr-DZ") + " DA";

export function Stars({ n = 5, size = 12 }: { n?: number; size?: number }) {
  return (
    <span style={{ fontSize: size, color: BRAND.gold, letterSpacing: 1 }}>
      {"★".repeat(Math.min(5, Math.round(n)))}
      {"☆".repeat(Math.max(0, 5 - Math.round(n)))}
    </span>
  );
}

export function ArtisanSeal({
  size = 128,
  color = "#ffffff",
  spin = true,
}: {
  size?: number;
  color?: string;
  spin?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={spin ? "seal-rotate" : ""}
      style={{ display: "block", flexShrink: 0 }}
    >
      <defs>
        <path
          id="sealArc"
          d="M 100,100 m -78,0 a 78,78 0 1,1 156,0 a 78,78 0 1,1 -156,0"
        />
      </defs>
      <circle cx="100" cy="100" r="96" fill="none" stroke={color} strokeOpacity="0.28" strokeWidth="1" />
      <circle cx="100" cy="100" r="58" fill="none" stroke={color} strokeOpacity="0.4" strokeWidth="1" />
      <text fill={color} fillOpacity="0.85" fontSize="11.5" letterSpacing="3.2" fontFamily="Inter, sans-serif" fontWeight="700">
        <textPath href="#sealArc" startOffset="2%">
          ARTISANAT • FRAÎCHEUR • QUALITÉ •
        </textPath>
      </text>
      <text x="100" y="93" textAnchor="middle" fontFamily="'Playfair Display', serif" fontStyle="italic" fontWeight="700" fontSize="26" fill={color}>
        ME
      </text>
      <text x="100" y="114" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="9.5" letterSpacing="2" fill={color} fillOpacity="0.75">
        DEPUIS 2023
      </text>
    </svg>
  );
}

export function GlobalStyle() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Inter:wght@300;400;500;600;700&display=swap');
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      html { scroll-behavior: smooth; }
      body { font-family: 'Inter', sans-serif; background: ${BRAND.cream}; color: ${BRAND.dark}; }
      button { cursor: pointer; border: none; font-family: inherit; }
      input, select, textarea { font-family: inherit; }
      a { text-decoration: none; color: inherit; }
      ::-webkit-scrollbar { width: 6px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: ${BRAND.teal}44; border-radius: 3px; }
      :focus-visible { outline: 2.5px solid ${BRAND.orange}; outline-offset: 2px; }

      .serif { font-family: 'Playfair Display', serif; }
      .eyebrow { color:${BRAND.orange}; font-weight:700; font-size:12px; letter-spacing:2.5px; text-transform:uppercase; }
      .badge { display:inline-block; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:700; letter-spacing:.4px; }
      .badge-new    { background:#EBF5FB; color:#2980B9; }
      .badge-conf   { background:#E8F8F5; color:#1ABC9C; }
      .badge-prep   { background:#FEF9E7; color:#F39C12; }
      .badge-ready  { background:#EAFAF1; color:#27AE60; }
      .badge-deliv  { background:#F4ECF7; color:#8E44AD; }
      .badge-done   { background:#EAECEE; color:#566573; }
      .badge-cancel { background:#FDEDEC; color:#E74C3C; }

      @keyframes fadeIn   { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
      @keyframes slideIn  { from{transform:translateX(100%)} to{transform:translateX(0)} }
      @keyframes float    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
      @keyframes bannerSlide { from{opacity:0;transform:translateX(-30px)} to{opacity:1;transform:translateX(0)} }
      @keyframes sealSpin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      @keyframes shimmer { 0%{background-position:-468px 0} 100%{background-position:468px 0} }

      .fadeIn    { animation: fadeIn .45s ease both; }
      .slideIn   { animation: slideIn .3s ease both; }
      .float     { animation: float 3s ease-in-out infinite; }
      .bannerIn  { animation: bannerSlide .7s ease both; }
      .seal-rotate { animation: sealSpin 34s linear infinite; }

      .skeleton {
        background: linear-gradient(90deg, #f0ebe5 25%, #e8e2d8 50%, #f0ebe5 75%);
        background-size: 936px 100%;
        animation: shimmer 1.4s infinite linear;
      }

      @media (prefers-reduced-motion: reduce) {
        *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; }
      }

      .btn-primary {
        background: ${BRAND.orange};
        color: #fff;
        border-radius: 30px;
        font-weight: 700;
        transition: transform .18s, box-shadow .18s, background .18s;
        box-shadow: 0 4px 18px ${BRAND.orange}44;
      }
      .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 28px ${BRAND.orange}55; background: ${BRAND.orangeDark}; }
      .btn-ghost {
        background: rgba(255,255,255,.12);
        color: #fff;
        border: 1.5px solid rgba(255,255,255,.4);
        border-radius: 30px;
        font-weight: 500;
        transition: background .18s;
        backdrop-filter: blur(6px);
      }
      .btn-ghost:hover { background: rgba(255,255,255,.26); }

      .card {
        background: #fff;
        border-radius: 18px;
        box-shadow: 0 2px 16px rgba(0,0,0,.07);
        border: 1px solid rgba(0,0,0,.05);
        overflow: hidden;
        transition: transform .25s, box-shadow .25s;
      }
      .card:hover { transform: translateY(-5px); box-shadow: 0 16px 40px rgba(10,61,64,.14); }
      .card .card-img { transition: transform .5s ease; }
      .card:hover .card-img { transform: scale(1.06); }

      .value-card { position:relative; border-radius:22px; overflow:hidden; min-height:340px; display:flex; align-items:flex-end; }
      .value-card img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; transition: transform .6s ease; }
      .value-card:hover img { transform: scale(1.05); }
      .value-card .value-overlay { position:relative; z-index:1; padding:26px 26px 24px; color:#fff; width:100%; }

      .trust-bar {
        display: flex; align-items: center; justify-content: center;
        gap: 32px; padding: 14px 24px;
        background: ${BRAND.tealInk}; color: rgba(255,255,255,.92);
        font-size: 13px; font-weight: 500; flex-wrap: wrap;
      }
      .trust-bar span { display:flex; align-items:center; gap:7px; }

      .promo-bar {
        background: linear-gradient(90deg, ${BRAND.tealDark}, ${BRAND.teal} 50%, ${BRAND.tealDark});
        color: #fff; text-align: center; padding: 9px 16px;
        font-size: 13px; font-weight: 600; letter-spacing: .3px;
      }

      .product-badge {
        position: absolute; top: 12px; left: 12px;
        padding: 4px 11px; border-radius: 20px;
        font-size: 10.5px; font-weight: 700; letter-spacing: .3px;
        z-index: 2; box-shadow: 0 3px 10px rgba(0,0,0,.18);
      }
      .badge-bestseller { background: ${BRAND.orange}; color: #fff; }
      .badge-coup       { background: #c0392b; color: #fff; }
      .badge-new2       { background: ${BRAND.teal}; color: #fff; }
      .badge-sg         { background: ${BRAND.green}; color: #fff; }
      .badge-gift       { background: ${BRAND.gold}; color: #fff; }

      @media (max-width: 768px) {
        .hide-mobile   { display: none !important; }
        .trust-bar     { gap: 16px; font-size: 12px; }
        .hero-headline { font-size: clamp(32px,7vw,52px) !important; }
      }
      @media (min-width: 769px) {
        .hide-desktop { display: none !important; }
      }
    `}</style>
  );
}

export function PromoBar() {
  const [idx, setIdx] = useState(0);
  const msgs = [
    "🚚 Livraison à domicile · Alger Centre dès 200 DA",
    "🍝 Préparées à la commande · Sans conservateurs · 100% artisanal",
    "🎁 Coffrets cadeaux disponibles · Parfait pour offrir",
  ];
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % msgs.length), 4000);
    return () => clearInterval(t);
  }, []);
  return <div className="promo-bar">{msgs[idx]}</div>;
}

export function TrustBar() {
  return (
    <div className="trust-bar">
      <span>🌾 100% Artisanal</span>
      <span>🥚 Ingrédients frais</span>
      <span>⚡ Livraison rapide</span>
      <span>💰 Paiement à la livraison</span>
      <span>⭐ +300 clients satisfaits</span>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Nouvelle: "badge-new",
    Confirmée: "badge-conf",
    "En préparation": "badge-prep",
    Prête: "badge-ready",
    "En livraison": "badge-deliv",
    Livrée: "badge-done",
    Annulée: "badge-cancel",
  };
  return <span className={`badge ${map[status] || ""}`}>{status}</span>;
}

export function getBadgeClass(badge: string | null): string | null {
  if (!badge) return null;
  if (badge === "Bestseller") return "badge-bestseller";
  if (badge === "Coup ❤️") return "badge-coup";
  if (badge === "Nouveau") return "badge-new2";
  if (badge === "Sans gluten") return "badge-sg";
  if (badge === "Idée cadeau" || badge === "Coup de cœur") return "badge-gift";
  return "badge-new2";
}
