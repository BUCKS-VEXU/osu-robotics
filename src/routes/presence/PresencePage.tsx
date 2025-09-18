import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Banner, Button, Card } from './ui';
import ActiveSessionsBoard from './ActiveSessionsBoard';
import useQuery from './useQuery';
import { fmtSince } from './format';

type Status = {
  isIn: boolean;
  location: string | null;
  since: string | null;
  user?: { id: string; handle?: string };
};

type LocationRow = { id: string; name: string; active: boolean };

export default function PresencePage() {
  const q = useQuery();

  const [me, setMe] = useState<{ authed: boolean; user?: { handle?: string } } | null>(null);
  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  /* Refresh every 15 seconds */
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 15_000);
    return () => clearInterval(id);
  }, []);

  const locId = (q.get('loc') || '').trim();

  const currentLocationId = useMemo(() => {
    const s = status?.location?.trim();
    return status?.isIn && s ? s : locId;
  }, [status?.isIn, status?.location, locId]);

  const [locationsList, setLocationsList] = useState<LocationRow[]>([]);
  const selectedLocation = useMemo(
    () => locationsList.find((l) => l.id === currentLocationId),
    [locationsList, currentLocationId],
  );
  const displayName = selectedLocation?.name ?? selectedLocation?.id ?? '';

  useEffect(() => {
    fetch('/auth/me')
      .then((r) => r.json())
      .then(setMe)
      .catch(() => setMe({ authed: false }));
  }, []);

  useEffect(() => {
    fetch('/api/presence/locations')
      .then((r) => r.json())
      .then((j) => setLocationsList(j.locations ?? []))
      .catch(() => setLocationsList([]));
  }, []);

  async function refresh() {
    const r = await fetch('/api/status');
    setStatus(await r.json());
  }
  useEffect(() => {
    refresh().catch(() => setErr('Failed to load status.'));
  }, [selectedLocation]);

  const navigate = useNavigate();
  function selectLocation(id: string) {
    navigate(`/presence?loc=${encodeURIComponent(id)}`, { replace: true });
  }

  async function checkIn() {
    if (!selectedLocation) return setErr('Missing location.');
    setLoading(true);
    setErr(null);
    try {
      const r = await fetch('/api/presence/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locationId: selectedLocation.id }),
      });
      if (!r.ok)
        throw new Error(
          (await r.json().catch(() => ({}))).error || `Check-in failed (${r.status})`,
        );
      await refresh();
    } catch (e: any) {
      setErr(e?.message || 'Check-in failed');
    } finally {
      setLoading(false);
    }
  }

  async function checkOut() {
    setLoading(true);
    setErr(null);
    try {
      const r = await fetch('/api/presence/checkout', { method: 'POST' });
      if (!r.ok)
        throw new Error(
          (await r.json().catch(() => ({}))).error || `Check-out failed (${r.status})`,
        );
      await refresh();
    } catch (e: any) {
      setErr(e?.message || 'Check-out failed');
    } finally {
      setLoading(false);
    }
  }

  // unauthenticated view
  if (!me) return null;
  if (!me.authed) {
    return (
      <div style={{ minHeight: '100%', display: 'grid', placeItems: 'center', padding: '24px' }}>
        <Card>
          <h1 style={{ fontSize: 28, margin: '0 0 6px' }}>
            Check In{selectedLocation ? ` · ${displayName}` : ''}
          </h1>
          <p style={{ color: 'var(--muted)', margin: '0 0 16px' }}>
            Sign in with Discord to continue.
          </p>
          <a href="/auth/discord">
            <Button>Continue with Discord</Button>
          </a>
        </Card>
      </div>
    );
  }

  // authenticated view
  const title = status?.isIn
    ? `Check Out · ${displayName}`
    : `Check In${selectedLocation ? ` · ${displayName}` : ''}`;

  return (
    <div style={{ minHeight: '100%', display: 'grid', placeItems: 'center', padding: '24px' }}>
      <Card>
        <header
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}
        >
          <h1 style={{ fontSize: 28, margin: 0 }}>{title}</h1>
          {me.user?.handle && (
            <span style={{ fontSize: 14, color: 'var(--muted)' }}>
              Signed in as <strong>{me.user.handle}</strong>
            </span>
          )}
        </header>

        <section style={{ marginTop: 12, marginBottom: 12 }}>
          <ActiveSessionsBoard />
        </section>

        {err && (
          <div style={{ marginBottom: 12 }}>
            <Banner tone="err">{err}</Banner>
          </div>
        )}

        {!status ? (
          <div style={{ color: 'var(--muted)' }}>Loading…</div>
        ) : status.isIn ? (
          <div style={{ display: 'grid', gap: 12 }}>
            <Banner tone="ok">
              You’re checked in at {displayName}&nbsp;
              <br />
              For <strong>{fmtSince(status.since)}</strong>
            </Banner>
            <Button variant="danger" onClick={checkOut} busy={loading}>
              Check Out
            </Button>
            <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0 }}>
              Leaving soon? Don’t forget to check out!
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            <Banner tone="info">
              You’re currently not checked in.
              <div style={{ display: 'grid', gap: 10 }}>
                <p style={{ margin: '6px 0 2px', color: 'var(--muted)' }}>Choose a location:</p>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                    gap: 10,
                  }}
                >
                  {locationsList.length === 0 ? (
                    <div style={{ color: 'var(--muted)' }}>Loading locations…</div>
                  ) : (
                    locationsList.map((l) => (
                      <button
                        key={l.id}
                        onClick={() => selectLocation(l.id)}
                        style={{
                          padding: '12px 10px',
                          borderRadius: 12,
                          border:
                            selectedLocation?.id === l.id
                              ? '1px solid var(--scarlet-700)'
                              : '1px solid rgba(0,0,0,.08)',
                          background:
                            selectedLocation?.id === l.id ? 'rgba(186, 12, 47, 0.1)' : '#fff',
                          boxShadow: '0 1px 2px rgba(0,0,0,.04)',
                          textAlign: 'center',
                          fontWeight: 600,
                        }}
                        aria-label={`Select ${l.name}`}
                      >
                        <div style={{ fontSize: 14 }}>{l.name || l.id}</div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </Banner>
            <Button onClick={checkIn} busy={loading} disabled={!selectedLocation}>
              {selectedLocation ? `Check In to ${displayName}` : 'Select a location'}
            </Button>
          </div>
        )}

        <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid rgba(0,0,0,.06)' }} />
        <footer style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <a
            href="/auth/logout"
            onClick={(e) => {
              e.preventDefault();
              fetch('/auth/logout', { method: 'POST' }).then(() => location.reload());
            }}
            style={{ fontSize: 13, color: 'var(--muted)', textDecoration: 'underline' }}
          >
            Log out
          </a>
        </footer>
      </Card>
    </div>
  );
}
