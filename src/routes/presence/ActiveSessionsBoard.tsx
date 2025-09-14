// src/components/ActiveSessionsBoard.tsx
import React, { useEffect, useMemo, useState } from 'react';

type ActiveSession = {
  id: string;
  since: string; // ISO checkInAt
  note?: string | null;
  location: { id: string; name: string };
  member: { id: string; handle: string; avatarUrl: string; isExec: boolean };
};

export default function ActiveSessionsBoard() {
  const [data, setData] = useState<ActiveSession[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const r = await fetch('/api/presence/active');
        if (!r.ok) throw new Error(await r.text());
        const j = (await r.json()) as { active: ActiveSession[] };
        if (alive) setData(j.active);
      } catch (e: any) {
        if (alive) setErr(e.message || 'Failed to load');
      }
    };
    load();
    const id = setInterval(load, 15000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  const grouped = useMemo(() => {
    const m = new Map<string, { location: ActiveSession['location']; people: ActiveSession[] }>();
    (data || []).forEach((ci) => {
      const k = ci.location.id;
      if (!m.has(k)) m.set(k, { location: ci.location, people: [] });
      m.get(k)!.people.push(ci);
    });
    // sort by location name
    return Array.from(m.values()).sort((a, b) => a.location.name.localeCompare(b.location.name));
  }, [data]);

  if (err)
    return (
      <Card>
        <h3>Currently Checked In</h3>
        <div style={{ color: 'var(--danger)' }}>{err}</div>
      </Card>
    );
  if (!data)
    return (
      <Card>
        <h3>Currently Checked In</h3>
        <div>Loading…</div>
      </Card>
    );
  if (data.length === 0)
    return (
      <Card>
        <h3>Currently Checked In</h3>
        <div style={{ color: 'var(--muted)' }}>No one is currently checked in.</div>
      </Card>
    );

  return (
    <div
      className="grid"
      style={{
        display: 'grid',
        gap: 16,
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
      }}
    >
      {grouped.map(({ location, people }) => (
        <div key={location.id} className="active-card">
          <div className="active-card__head">
            <h3 className="active-card__title">{location.name}</h3>
            <span className="active-card__count">{people.length}</span>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {people
              .sort((a, b) => a.member.handle.localeCompare(b.member.handle))
              .map((ci) => (
                <li key={ci.id} className="active-row">
                  <Avatar url={ci.member.avatarUrl} name={/*ci.member.name ||*/ ci.member.handle} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                      <strong>{/*ci.member.name ||*/ ci.member.handle}</strong>
                      <span
                        className="active-row__meta"
                        title={new Date(ci.since).toLocaleString()}
                      >
                        {rel(new Date(ci.since))}
                      </span>
                    </div>
                    {ci.note && (
                      <div
                        style={{
                          color: 'var(--muted)',
                          fontSize: 12,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {ci.note}
                      </div>
                    )}
                  </div>
                </li>
              ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function rel(d: Date) {
  const sec = Math.floor((Date.now() - d.getTime()) / 1000);
  if (sec < 60) return `${sec}s`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h`;
  const day = Math.floor(hr / 24);
  return `${day}d`;
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: 'var(--elev)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        boxShadow: '0 8px 24px rgb(0 0 0 / 6%)',
        padding: 16,
      }}
    >
      {children}
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        background: 'var(--chip)',
        color: 'var(--fg)',
        borderRadius: 999,
        padding: '2px 8px',
        fontSize: 12,
      }}
    >
      {children}
    </span>
  );
}

function Avatar({ url, name }: { url?: string | null; name: string }) {
  const initials = name
    .split(/\s+/)
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <div
      style={{
        width: 32,
        height: 32,
        borderRadius: '50%',
        background: 'var(--surface)',
        display: 'grid',
        placeItems: 'center',
        overflow: 'hidden',
        fontWeight: 700,
      }}
    >
      {url ? (
        <img src={url} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        initials
      )}
    </div>
  );
}
