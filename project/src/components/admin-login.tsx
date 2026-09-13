import { useState } from "react";
import { supabase, BRAND, ArtisanSeal } from "@/components/shared-deps";

export function AdminLogin({ onSuccess }: { onSuccess: (token: string) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { data, error: rpcError } = await supabase.rpc("admin_login", {
        p_email: email,
        p_password: password,
      });
      if (rpcError) throw rpcError;
      if (!data) throw new Error("Email ou mot de passe incorrect");
      onSuccess(data as string);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Email ou mot de passe incorrect");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: `linear-gradient(135deg, ${BRAND.tealInk}, ${BRAND.tealDark})`, padding: 24 }}>
      <div style={{ maxWidth: 400, width: "100%", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
          <ArtisanSeal size={80} spin={false} />
        </div>
        <h1 className="serif" style={{ fontSize: 28, fontStyle: "italic", color: "#fff", marginBottom: 6 }}>Maison Églantine</h1>
        <p style={{ color: "rgba(255,255,255,.6)", fontSize: 13, marginBottom: 32, letterSpacing: 1, textTransform: "uppercase" }}>Espace Administration</p>

        <form onSubmit={handleLogin} style={{ background: "#fff", borderRadius: 20, padding: 32, boxShadow: "0 16px 48px rgba(0,0,0,.2)" }}>
          <div style={{ marginBottom: 16, textAlign: "left" }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: BRAND.dark, display: "block", marginBottom: 6 }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@eglantine.com"
              style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: `1.5px solid ${BRAND.teal}44`, fontSize: 14, outline: "none", transition: "border .2s" }}
            />
          </div>
          <div style={{ marginBottom: 20, textAlign: "left" }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: BRAND.dark, display: "block", marginBottom: 6 }}>Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: `1.5px solid ${BRAND.teal}44`, fontSize: 14, outline: "none", transition: "border .2s" }}
            />
          </div>

          {error && (
            <div style={{ background: "#FDEDEC", color: BRAND.red, borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: 13, fontWeight: 600 }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: "100%", padding: "14px", fontSize: 15, opacity: loading ? .6 : 1, cursor: loading ? "not-allowed" : "pointer" }}
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <p style={{ color: "rgba(255,255,255,.4)", fontSize: 12, marginTop: 24 }}>Accès réservé à l'administrateur</p>
      </div>
    </div>
  );
}
