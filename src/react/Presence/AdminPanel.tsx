import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Banner } from './ui';

type Member = { id: string; handle?: string };
type Loc = { id: string; name?: string };
type Session = {
  id: string;
  memberId: string;
  member?: Member;
  location?: Loc;
  checkInAt: string | null;
  checkOutAt: string | null;
  notes?: string | null;
};

export default function AdminPanel() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [config, setConfig] = useState<{ autokickMinutes: number }>({ autokickMinutes: 60 });
  const [stats, setStats] = useState<{ guilds?: number; uptimeSec?: number } | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [edit, setEdit] = useState<Partial<Session> | null>(null);

  async function guard() {
    const r = await fetch('/api/admin/ping');
    if (!r.ok) {
      nav('/presence', { replace: true });
      throw new Error('not exec');
    }
  }

  async function loadAll() {
    await guard();
    const [s, c, d] = await Promise.all([
      fetch('/api/admin/sessions').then((r) => r.json()),
      fetch('/api/admin/config').then((r) => r.json()),
      fetch('/api/admin/discord-stats').then((r) => r.json()),
    ]);
    setSessions(s.sessions || []);
    setConfig(c.config || { autokickMinutes: 60 });
    setStats(d.stats || {});
  }

  useEffect(() => {
    (async () => {
      try {
        await loadAll();
      } catch (e: any) {
        setErr(e?.message || 'Failed to load admin data');
      } finally {
        setLoading(false);
      }
    })();
    // no deps
  }, []);

  const heat = useMemo(() => {
    // Map key: `${locId}:${YYYY-MM-DD}:${H}`
    const map = new Map<string, number>();
    const now = Date.now();
    const since = now - 7 * 24 * 3600 * 1000;
    for (const s of sessions) {
      if (!s.checkInAt) continue;
      const t = new Date(s.checkInAt).getTime();
      if (t < since) continue;
      const d = new Date(t);
      const day = d.toISOString().slice(0, 10);
      const hour = d.getHours();
      const loc = s.location?.id || 'unknown';
      const k = `${loc}:${day}:${hour}`;
      map.set(k, (map.get(k) || 0) + 1);
    }
    const locs = Array.from(new Set(sessions.map((s) => s.location?.id || 'unknown'))).sort();
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now - (6 - i) * 24 * 3600 * 1000);
      return d.toISOString().slice(0, 10);
    });
    return { map, locs, days };
  }, [sessions]);

  async function saveSession(p: Partial<Session>) {
    const isEdit = !!p.id;
    const url = isEdit ? `/api/admin/sessions/${p.id}` : '/api/admin/sessions';
    const method = isEdit ? 'PATCH' : 'POST';
    const r = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(p),
    });
    if (!r.ok) throw new Error('save failed');
    setEdit(null);
    await loadAll();
  }

  async function deleteSession(id: string) {
    if (!confirm('Delete this session?')) return;
    const r = await fetch(`/api/admin/sessions/${id}`, { method: 'DELETE' });
    if (!r.ok) throw new Error('delete failed');
    await loadAll();
  }

  async function saveConfig() {
    const r = await fetch('/api/admin/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    if (!r.ok) throw new Error('config update failed');
  }

  if (loading) return null;

  return (
    <div style={{ padding: 24, display: 'grid', gap: 16 }}>
      <Card>
        <header
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}
        >
          <h1 style={{ margin: 0 }}>BUCKS Admin</h1>
          <a href="/presence" style={{ fontSize: 13 }}>
            Back to Presence
          </a>
        </header>

        {err && <Banner tone="err">{err}</Banner>}

        <section
          style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginTop: 12 }}
        >
          <div>
            <h3 style={{ margin: '6px 0' }}>Heatmap (last 7 days)</h3>
            <Heatmap days={heat.days} locs={heat.locs} map={heat.map} />
          </div>

          <div>
            <h3 style={{ margin: '6px 0' }}>Autokick</h3>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                type="number"
                value={config.autokickMinutes}
                onChange={(e) => setConfig({ autokickMinutes: Number(e.target.value) || 0 })}
                style={{ width: 120 }}
              />
              <span style={{ color: 'var(--muted)', fontSize: 13 }}>minutes</span>
              <Button onClick={saveConfig}>Save</Button>
            </div>

            <h3 style={{ margin: '16px 0 6px' }}>Discord bot</h3>
            <div style={{ fontSize: 13 }}>
              <div>Guilds: {stats?.guilds ?? '—'}</div>
              <div>Uptime: {stats?.uptimeSec ? Math.round(stats.uptimeSec / 60) + 'm' : '—'}</div>
              <Button onClick={loadAll} style={{ marginTop: 8 }}>
                Refresh
              </Button>
            </div>
          </div>
        </section>

        <hr style={{ margin: '16px 0' }} />

        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: '6px 0' }}>Sessions</h3>
            <Button onClick={() => setEdit({})}>+ New</Button>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid #eee' }}>
                <th>Member</th>
                <th>Location</th>
                <th>In</th>
                <th>Out</th>
                <th>Notes</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr key={s.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                  <td>{s.member?.handle ?? s.memberId}</td>
                  <td>{s.location?.name ?? s.location?.id}</td>
                  <td>{s.checkInAt ? new Date(s.checkInAt).toLocaleString() : '—'}</td>
                  <td>{s.checkOutAt ? new Date(s.checkOutAt).toLocaleString() : '—'}</td>
                  <td>{s.notes ?? ''}</td>
                  <td>
                    <Button onClick={() => setEdit(s)}>Edit</Button>{' '}
                    <Button onClick={() => deleteSession(s.id)} variant="danger">
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </Card>

      {edit && (
        <Dialog title={edit.id ? 'Edit Session' : 'New Session'} onClose={() => setEdit(null)}>
          <FormRow label="Member ID">
            <input
              defaultValue={edit.memberId || ''}
              onChange={(e) => (edit.memberId = e.target.value)}
            />
          </FormRow>
          <FormRow label="Location ID">
            <input
              defaultValue={edit.location?.id || ''}
              onChange={(e) => (edit.location = { id: e.target.value, name: e.target.value })}
            />
          </FormRow>
          <FormRow label="Check In (ISO)">
            <input
              defaultValue={edit.checkInAt || ''}
              onChange={(e) => (edit.checkInAt = e.target.value)}
            />
          </FormRow>
          <FormRow label="Check Out (ISO)">
            <input
              defaultValue={edit.checkOutAt || ''}
              onChange={(e) => (edit.checkOutAt = e.target.value)}
            />
          </FormRow>
          <FormRow label="Notes">
            <input
              defaultValue={edit.notes || ''}
              onChange={(e) => (edit.notes = e.target.value)}
            />
          </FormRow>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Button onClick={() => saveSession(edit)}>Save</Button>
            <Button variant="ghost" onClick={() => setEdit(null)}>
              Cancel
            </Button>
          </div>
        </Dialog>
      )}
    </div>
  );
}

function Heatmap({
  days,
  locs,
  map,
}: {
  days: string[];
  locs: string[];
  map: Map<string, number>;
}) {
  // rows: hours 0..23, columns: day × location stack
  const hours = Array.from({ length: 24 }, (_, i) => i);
  return (
    <div style={{ overflowX: 'auto' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `120px repeat(${days.length * locs.length}, 20px)`,
          gap: 4,
        }}
      >
        <div />
        {days.map((d) =>
          locs.map((l) => (
            <div
              key={d + l}
              title={`${d} · ${l}`}
              style={{ fontSize: 10, textAlign: 'center', color: 'var(--muted)' }}
            >
              {l}
            </div>
          )),
        )}
        {hours.map((h) => (
          <div key={h} style={{ display: 'contents' }}>
            <div style={{ fontSize: 12 }}>{`${h}:00`}</div>
            {days.map((d) =>
              locs.map((l) => {
                const v = map.get(`${l}:${d}:${h}`) || 0;
                const alpha = Math.min(0.5, 0.06 + 0.1 * v);
                return (
                  <div
                    key={`${d}${l}${h}`}
                    title={`${d} ${h}:00 · ${l} = ${v}`}
                    style={{
                      width: 20,
                      height: 16,
                      borderRadius: 3,
                      background: `rgba(186,12,47,${alpha})`,
                      border: '1px solid rgba(0,0,0,0.04)',
                    }}
                  />
                );
              }),
            )}
          </div>
        ))}
      </div>
      <div style={{ marginTop: 6, fontSize: 12, color: 'var(--muted)' }}>
        brightness ≈ count (per hour · per location)
      </div>
    </div>
  );
}

function Dialog({ title, children, onClose }: any) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,.35)',
        display: 'grid',
        placeItems: 'center',
      }}
    >
      <div style={{ background: '#fff', padding: 16, borderRadius: 12, minWidth: 520 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <h3 style={{ margin: 0 }}>{title}</h3>
          <button onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>{children}</div>
      </div>
    </div>
  );
}
function FormRow({ label, children }: any) {
  return (
    <label style={{ display: 'grid', gap: 6 }}>
      <span style={{ fontSize: 12, color: 'var(--muted)' }}>{label}</span>
      {children}
    </label>
  );
}

