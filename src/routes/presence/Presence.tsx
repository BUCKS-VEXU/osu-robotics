import { useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { Banner, Button, Card } from "./ui";

type Status = {
    isIn: boolean;
    location: string | null;
    since: string | null;
    user?: { id: string; handle?: string };
};

function useQuery() {
    const { search } = useLocation();
    return useMemo(() => new URLSearchParams(search), [search]);
}

function fmtSince(iso?: string | null) {
    if (!iso) return "";
    const start = new Date(iso).getTime();
    const mins = Math.max(0, Math.floor((Date.now() - start) / 60000));
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h ? `${h}h ${m}m` : `${m}m`;
}

export default function PresencePage() {
    const q = useQuery();
    const { loc: locParam } = useParams<{ loc: string }>();
    const loc = (q.get("loc") || locParam || "").trim().toLowerCase();

    const [me, setMe] = useState<{ authed: boolean; user?: { handle?: string } } | null>(null);
    const [status, setStatus] = useState<Status | null>(null);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);
    const [tick, setTick] = useState(0);

    useEffect(() => {
      fetch("/auth/me").then(r => r.json()).then(setMe).catch(() => setMe({ authed: false }));
  }, []);
    useEffect(() => { const id = setInterval(() => setTick(x => x + 1), 30_000); return () => clearInterval(id); }, []);
    async function refresh() { const r = await fetch("/api/status"); setStatus(await r.json()); }

    useEffect(() => { refresh().catch(() => setErr("Failed to load status.")); }, [loc]);

    async function checkIn() {
        if (!loc) return setErr("Missing location.");
      setLoading(true); setErr(null);
      try {
          const r = await fetch("/api/checkin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ locationId: loc }) });
          if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || `Check-in failed (${r.status})`);
          await refresh();
      } catch (e: any) { setErr(e?.message || "Check-in failed"); }
      finally { setLoading(false); }
  }

    async function checkOut() {
      setLoading(true); setErr(null);
      try {
          const r = await fetch("/api/checkout", { method: "POST" });
          if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || `Check-out failed (${r.status})`);
          await refresh();
      } catch (e: any) { setErr(e?.message || "Check-out failed"); }
      finally { setLoading(false); }
  }

    // unauthenticated view
    if (!me) return null;
    if (!me.authed) {
        return (
            <div style={{ minHeight: "100%", display: "grid", placeItems: "center", padding: "24px" }}>
                <Card>
                    <h1 style={{ fontSize: 28, margin: "0 0 6px" }}>Check In{loc ? ` · ${loc}` : ""}</h1>
                    <p style={{ color: "var(--muted)", margin: "0 0 16px" }}>Sign in with Discord to continue.</p>
                    <a href="/auth/discord">
                        <Button>Continue with Discord</Button>
                    </a>
                </Card>
            </div>
        );
  }

    // authenticated view
    const title = `Check In${loc ? ` · ${loc}` : ""}`;

    return (
      <div style={{ minHeight: "100%", display: "grid", placeItems: "center", padding: "24px" }}>
          <Card>
              <header style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <h1 style={{ fontSize: 28, margin: 0 }}>{title}</h1>
                  {me.user?.handle && <span style={{ fontSize: 14, color: "var(--muted)" }}>Signed in as <strong>{me.user.handle}</strong></span>}
              </header>

              <p style={{ color: "var(--muted)", margin: "8px 0 16px" }}>
                    Auth is live; reminders coming soon.
              </p>

              {err && <div style={{ marginBottom: 12 }}><Banner tone="err">{err}</Banner></div>}

              {!status ? (
                  <div style={{ color: "var(--muted)" }}>Loading…</div>
              ) : status.isIn ? (
                      <div style={{ display: "grid", gap: 12 }}>
                          <Banner tone="ok">
                              You’re checked in{status.location ? ` at ${status.location}` : ""}.&nbsp;
                              On site: <strong>{fmtSince(status.since)}{tick ? "" : ""}</strong>
                          </Banner>
                          <Button variant="danger" onClick={checkOut} busy={loading}>Check Out</Button>
                          <p style={{ fontSize: 12, color: "var(--muted)", margin: 0 }}>
                              Leaving soon? Don’t forget to check out so your hours are accurate.
                          </p>
                      </div>
                  ) : (
                          <div style={{ display: "grid", gap: 12 }}>
                              <Banner tone="info">
                                  You’re currently not checked in.
                                  {!loc && <> Add <code>?loc=workshop</code> or use <code>/p/workshop</code>.</>}
                              </Banner>
                              <Button onClick={checkIn} busy={loading} disabled={!loc}>
                                  {loc ? `Check In to ${loc}` : "Select a location"}
                                </Button>
                  </div>
              )}

              <hr style={{ margin: "20px 0", border: "none", borderTop: "1px solid rgba(0,0,0,.06)" }} />
              <footer style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <a href="/auth/logout" onClick={(e) => { e.preventDefault(); fetch("/auth/logout", { method: "POST" }).then(() => location.reload()); }}
                      style={{ fontSize: 13, color: "var(--muted)", textDecoration: "underline" }}>
                      Log out
                  </a>
                  <a href="/" style={{
                      display: "inline-flex", alignItems: "center", gap: 8,
                      color: "#fff", background: "linear-gradient(135deg, var(--scarlet), var(--scarlet-700))",
                      padding: "10px 12px", borderRadius: 12, textDecoration: "none", fontWeight: 700
                  }}>
                      <span>BUCKS</span>
                  </a>
              </footer>
          </Card>
      </div>
  );
}
