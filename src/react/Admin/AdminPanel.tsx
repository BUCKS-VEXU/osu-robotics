import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Banner } from '../common/ui';

// ——— Types mirrored from server ———
type Member = { id: string; handle?: string | null; avatarUrl?: string | null; isExec?: boolean };
type Loc = { id: string; name?: string | null; active?: boolean };
type Session = {
  id: string;
  memberId: string;
  member?: { id: string; handle?: string | null } | null;
  location?: { id: string; name?: string | null } | null;
  checkInAt: string | null;
  checkOutAt: string | null;
  notes?: string | null;
};

// ——— Small fetch helper ———
async function j<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const r = await fetch(input, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!r.ok) {
    const msg = await r.text().catch(() => '');
    throw new Error(msg || `HTTP ${r.status}`);
  }
  return r.json();
}

// Date helpers
function toLocalInputValue(iso: string | null | undefined) {
  if (!iso) return '';
  const d = new Date(iso);
  // yyyy-MM-ddThh:mm for <input type="datetime-local">
  const pad = (n: number) => String(n).padStart(2, '0');
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}
function fromLocalInputValue(v: string): string | null {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(+d) ? null : d.toISOString();
}
function durationMs(aIso: string | null, bIso: string | null | undefined) {
  if (!aIso) return 0;
  const a = new Date(aIso).getTime();
  const b = bIso ? new Date(bIso).getTime() : Date.now();
  return Math.max(0, b - a);
}
function fmtDuration(ms: number) {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h) return `${h}h ${m}m`;
  if (m) return `${m}m ${sec}s`;
  return `${sec}s`;
}

type MemberHours = { memberId: string; from: string; to: string; totalMs: number; hours: number };
type BoardRow = {
  memberId: string;
  handle?: string | null;
  totalMs: number;
  hours: number;
  sessions: number;
};

export default function AdminPanel() {
  const nav = useNavigate();

  // ——— data ———
  const [members, setMembers] = useState<Member[]>([]);
  const [locations, setLocations] = useState<Loc[]>([]);
  const [active, setActive] = useState<Session[]>([]);
  const [past, setPast] = useState<Session[]>([]);
  const [totalPast, setTotalPast] = useState<number>(0);

  // leaderboard
  const [hoursMemberId, setHoursMemberId] = useState<string>('');
  const [hoursFrom, setHoursFrom] = useState<string>(''); // yyyy-MM-dd
  const [hoursTo, setHoursTo] = useState<string>(''); // yyyy-MM-dd
  const [memberHours, setMemberHours] = useState<MemberHours | null>(null);

  const [leaderboard, setLeaderboard] = useState<BoardRow[]>([]);
  const [lbLimit, setLbLimit] = useState<number>(10);

  // filters / paging
  const [memberId, setMemberId] = useState<string>('');
  const [locationId, setLocationId] = useState<string>('');
  const [from, setFrom] = useState<string>(''); // yyyy-MM-dd
  const [to, setTo] = useState<string>(''); // yyyy-MM-dd
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);

  // config
  const [autokick, setAutokick] = useState<number>(60);
  const [savingCfg, setSavingCfg] = useState<boolean>(false);

  // ui
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Session | null>(null);
  const [editIn, setEditIn] = useState<string>(''); // datetime-local
  const [editOut, setEditOut] = useState<string>(''); // datetime-local
  const [editNotes, setEditNotes] = useState<string>('');

  // ——— guard + initial load ———
  useEffect(() => {
    (async () => {
      try {
        await j('api/admin/ping'); // will 401 if not exec
        const [{ members }, { locations }, { config }, { sessions: act }, pastPayload] =
          await Promise.all([
            j<{ members: Member[] }>('api/admin/members'),
            j<{ locations: Loc[] }>('api/admin/locations'),
            j<{ config: { autokickMinutes: number } }>('api/admin/config'),
            j<{ sessions: Session[]; cached: boolean }>('api/admin/sessions/active'),
            j<{ sessions: Session[]; total: number; page: number; pageSize: number }>(
              `api/admin/sessions/past?page=${page}&pageSize=${pageSize}`,
            ),
          ]);
        setMembers(members);
        setLocations(locations);
        setAutokick(config.autokickMinutes);
        setActive(act);
        setPast(pastPayload.sessions);
        setTotalPast(pastPayload.total);
      } catch (e: any) {
        if (String(e?.message || '').includes('not exec')) {
          nav('/presence', { replace: true });
        } else {
          setError(e?.message || 'Failed to load admin data');
        }
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // refresh active every 20s
  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const { sessions } = await j<{ sessions: Session[] }>('api/admin/sessions/active');
        setActive(sessions);
      } catch {
        /* ignore */
      }
    }, 20_000);
    return () => clearInterval(id);
  }, []);

  // query past with filters
  async function reloadPast(resetPage = false) {
    try {
      const p = resetPage ? 1 : page;
      const q = new URLSearchParams();
      q.set('page', String(p));
      q.set('pageSize', String(pageSize));
      if (memberId) q.set('memberId', memberId);
      if (locationId) q.set('locationId', locationId);
      if (from) q.set('from', new Date(from).toISOString());
      if (to) {
        // include entire 'to' day
        const d = new Date(to);
        d.setHours(23, 59, 59, 999);
        q.set('to', d.toISOString());
      }
      const r = await j<{ sessions: Session[]; total: number; page: number; pageSize: number }>(
        `api/admin/sessions/past?${q.toString()}`,
      );
      if (resetPage) setPage(1);
      setPast(r.sessions);
      setTotalPast(r.total);
    } catch (e: any) {
      setError(e?.message || 'Failed to load past sessions');
    }
  }

  async function computeMemberHours() {
    if (!hoursMemberId) return;
    const q = new URLSearchParams();
    q.set('memberId', hoursMemberId);
    if (hoursFrom) q.set('from', new Date(hoursFrom).toISOString());
    if (hoursTo) {
      const d = new Date(hoursTo);
      d.setHours(23, 59, 59, 999);
      q.set('to', d.toISOString());
    }
    const res = await j<MemberHours>(`api/admin/stats/member-hours?${q.toString()}`);
    setMemberHours(res);
  }

  async function loadLeaderboard() {
    const q = new URLSearchParams();
    q.set('limit', String(lbLimit));
    if (hoursFrom) q.set('from', new Date(hoursFrom).toISOString());
    if (hoursTo) {
      const d = new Date(hoursTo);
      d.setHours(23, 59, 59, 999);
      q.set('to', d.toISOString());
    }
    const res = await j<{ leaderboard: BoardRow[] }>(`api/admin/stats/leaderboard?${q.toString()}`);
    setLeaderboard(res.leaderboard);
  }

  // ——— actions ———
  async function endSession(id: string) {
    try {
      await j(`api/admin/sessions/${id}/checkout`, { method: 'POST' });
      // remove from active and let past refresh lazily if it’s on first page
      setActive((xs) => xs.filter((s) => s.id !== id));
      // optionally prepend to past if filters allow; easiest: just refresh page 1 if we’re on it
      if (page === 1 && !memberId && !locationId && !from && !to) {
        reloadPast(true);
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to end session');
    }
  }

  function openEdit(s: Session) {
    setEditTarget(s);
    setEditIn(toLocalInputValue(s.checkInAt));
    setEditOut(toLocalInputValue(s.checkOutAt));
    setEditNotes(s.notes || '');
    setEditOpen(true);
  }
  async function saveEdit() {
    if (!editTarget) return;
    try {
      const payload: any = {};
      const isoIn = fromLocalInputValue(editIn);
      const isoOut = fromLocalInputValue(editOut);
      if (isoIn !== null) payload.checkInAt = isoIn;
      // nullable out
      payload.checkOutAt = isoOut;
      payload.notes = editNotes || null;

      const { session } = await j<{ session: Session }>(
        `api/admin/sessions/${editTarget.id}/time`,
        {
          method: 'PATCH',
          body: JSON.stringify(payload),
        },
      );

      // update locally in active/past lists
      setActive((xs) =>
        xs.map((s) => (s.id === session.id ? session : s)).filter((s) => s.checkOutAt === null),
      );
      setPast((xs) => xs.map((s) => (s.id === session.id ? session : s)));
      setEditOpen(false);
    } catch (e: any) {
      setError(e?.message || 'Failed to save edit');
    }
  }

  async function saveConfig() {
    try {
      setSavingCfg(true);
      await j('api/admin/config', {
        method: 'POST',
        body: JSON.stringify({ autokickMinutes: autokick }),
      });
    } catch (e: any) {
      setError(e?.message || 'Failed to save config');
    } finally {
      setSavingCfg(false);
    }
  }

  // ——— derived ———
  const activeEnriched = useMemo(() => {
    return active
      .map((s) => ({
        ...s,
        memberLabel: s.member?.handle ?? s.memberId,
        locLabel: s.location?.name ?? '—',
        durMs: durationMs(s.checkInAt, s.checkOutAt ?? null),
      }))
      .sort((a, b) => b.durMs - a.durMs);
  }, [active]);

  // ——— render ———
  if (loading) {
    return (
      <div style={{ padding: 20 }}>
        <Banner tone="info">Loading admin data…</Banner>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 20 }}>
        <Banner tone="err">{error}</Banner>
      </div>
    );
  }

  return (
    <div style={{ padding: 16, display: 'grid', gap: 16 }}>
      <h1 style={{ margin: 0 }}>Admin Panel</h1>

      {/* Config */}
      <Card>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 12,
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ fontWeight: 600 }}>Presence Settings</div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>
              Configure automatic checkout (“autokick”) for idle sessions.
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={{ display: 'grid', gap: 4 }}>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>Autokick Minutes</span>
              <input
                type="number"
                min={0}
                value={autokick}
                onChange={(e) => setAutokick(Number(e.target.value))}
                style={{ width: 120 }}
              />
            </label>
            <Button onClick={saveConfig} disabled={savingCfg}>
              {savingCfg ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Active sessions */}
      <Card>
        <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontWeight: 600 }}>Active Sessions</div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>
              Live list (server-cached). End sessions or adjust times.
            </div>
          </div>
          <Button
            onClick={() => j('api/admin/sessions/active').then((r: any) => setActive(r.sessions))}
          >
            Refresh
          </Button>
        </div>

        {activeEnriched.length === 0 ? (
          <div style={{ padding: 8, color: 'var(--muted)' }}>No active sessions.</div>
        ) : (
          <div className="table" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <Th>Member</Th>
                  <Th>Location</Th>
                  <Th>Check-in</Th>
                  <Th>Duration</Th>
                  <Th>Notes</Th>
                  <Th right>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {activeEnriched.map((s) => (
                  <tr key={s.id}>
                    <Td>{s.memberLabel}</Td>
                    <Td>{s.locLabel}</Td>
                    <Td mono>{s.checkInAt ? new Date(s.checkInAt).toLocaleString() : '—'}</Td>
                    <Td>{fmtDuration(s.durMs)}</Td>
                    <Td>{s.notes ?? '—'}</Td>
                    <Td right>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        <Button onClick={() => openEdit(s)} variant="primary">
                          Edit
                        </Button>
                        <Button onClick={() => endSession(s.id)}>End</Button>
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 600 }}>Hours & Leaderboard</div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>
              Compute total hours for a member or show a leaderboard over a date range.
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'end' }}>
            <label style={{ display: 'grid', gap: 4 }}>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>Member</span>
              <select
                value={hoursMemberId}
                onChange={(e) => setHoursMemberId(e.target.value)}
                style={{ minWidth: 200 }}
              >
                <option value="">Select member…</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.handle || m.id}
                  </option>
                ))}
              </select>
            </label>
            <label style={{ display: 'grid', gap: 4 }}>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>From</span>
              <input type="date" value={hoursFrom} onChange={(e) => setHoursFrom(e.target.value)} />
            </label>
            <label style={{ display: 'grid', gap: 4 }}>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>To</span>
              <input type="date" value={hoursTo} onChange={(e) => setHoursTo(e.target.value)} />
            </label>
            <Button onClick={computeMemberHours} disabled={!hoursMemberId}>
              Compute
            </Button>
            {memberHours && (
              <div style={{ marginLeft: 8, fontFamily: 'ui-monospace,Menlo,Consolas,monospace' }}>
                Total: <b>{memberHours.hours.toFixed(2)}h</b>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'end' }}>
            <label style={{ display: 'grid', gap: 4 }}>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>Top N</span>
              <select value={lbLimit} onChange={(e) => setLbLimit(Number(e.target.value))}>
                {[5, 10, 15, 20, 50].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
            <Button onClick={loadLeaderboard}>Load Leaderboard</Button>
          </div>

          {leaderboard.length > 0 && (
            <div className="table" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <Th>#</Th>
                    <Th>Member</Th>
                    <Th right>Sessions</Th>
                    <Th right>Hours</Th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((r, i) => (
                    <tr key={r.memberId}>
                      <Td>{i + 1}</Td>
                      <Td>{r.handle ?? r.memberId}</Td>
                      <Td right>{r.sessions}</Td>
                      <Td right>{r.hours.toFixed(2)}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>

      {/* Past sessions */}
      <Card>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 12,
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ fontWeight: 600 }}>Past Sessions</div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>
              History with filters & pagination.
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'end' }}>
            <label style={{ display: 'grid', gap: 4 }}>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>Member</span>
              <select value={memberId} onChange={(e) => setMemberId(e.target.value)}>
                <option value="">All</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.handle || m.id}
                  </option>
                ))}
              </select>
            </label>
            <label style={{ display: 'grid', gap: 4 }}>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>Location</span>
              <select value={locationId} onChange={(e) => setLocationId(e.target.value)}>
                <option value="">All</option>
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name || l.id}
                  </option>
                ))}
              </select>
            </label>
            <label style={{ display: 'grid', gap: 4 }}>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>From</span>
              <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            </label>
            <label style={{ display: 'grid', gap: 4 }}>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>To</span>
              <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </label>
            <label style={{ display: 'grid', gap: 4 }}>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>Page size</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
              >
                {[10, 25, 50, 100].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
            <Button onClick={() => reloadPast(true)} variant="primary">
              Apply
            </Button>
          </div>
        </div>

        <div className="table" style={{ overflowX: 'auto', marginTop: 10 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <Th>Member</Th>
                <Th>Location</Th>
                <Th>Check-in</Th>
                <Th>Check-out</Th>
                <Th>Duration</Th>
                <Th>Notes</Th>
                <Th right>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {past.map((s) => {
                const dur = fmtDuration(durationMs(s.checkInAt, s.checkOutAt));
                return (
                  <tr key={s.id}>
                    <Td>{s.member?.handle ?? s.memberId}</Td>
                    <Td>{s.location?.name ?? '—'}</Td>
                    <Td mono>{s.checkInAt ? new Date(s.checkInAt).toLocaleString() : '—'}</Td>
                    <Td mono>{s.checkOutAt ? new Date(s.checkOutAt).toLocaleString() : '—'}</Td>
                    <Td>{dur}</Td>
                    <Td>{s.notes ?? '—'}</Td>
                    <Td right>
                      <Button onClick={() => openEdit(s)} variant="primary">
                        Edit
                      </Button>
                    </Td>
                  </tr>
                );
              })}
              {past.length === 0 && (
                <tr>
                  <Td colSpan={7} style={{ color: 'var(--muted)' }}>
                    No sessions found.
                  </Td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* pagination */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>
            {totalPast === 0
              ? '0 results'
              : `Showing ${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, totalPast)} of ${totalPast}`}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
              Prev
            </Button>
            <Button disabled={page * pageSize >= totalPast} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
            <Button onClick={() => reloadPast(false)} variant="primary">
              Reload
            </Button>
          </div>
        </div>
      </Card>

      {/* Edit Modal */}
      {editOpen && (
        <Modal title="Edit Session" onClose={() => setEditOpen(false)}>
          <div style={{ display: 'grid', gap: 10 }}>
            <FormRow label="Member">
              <div>{editTarget?.member?.handle ?? editTarget?.memberId}</div>
            </FormRow>
            <FormRow label="Location">
              <div>{editTarget?.location?.name ?? '—'}</div>
            </FormRow>
            <FormRow label="Check-in">
              <input
                type="datetime-local"
                value={editIn}
                onChange={(e) => setEditIn(e.target.value)}
              />
            </FormRow>
            <FormRow label="Check-out">
              <input
                type="datetime-local"
                value={editOut}
                onChange={(e) => setEditOut(e.target.value)}
              />
            </FormRow>
            <FormRow label="Notes">
              <textarea value={editNotes} onChange={(e) => setEditNotes(e.target.value)} rows={3} />
            </FormRow>

            <div style={{ fontSize: 12, color: 'var(--muted)' }}>
              Duration preview:{' '}
              {fmtDuration(
                durationMs(fromLocalInputValue(editIn), fromLocalInputValue(editOut) ?? undefined),
              )}
            </div>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <Button variant="primary" onClick={() => setEditOpen(false)}>
                Cancel
              </Button>
              <Button onClick={saveEdit}>Save</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ——— Small presentational helpers ———
function Th({ children, right = false }: any) {
  return (
    <th
      style={{
        textAlign: right ? 'right' : 'left',
        fontSize: 12,
        color: 'var(--muted)',
        fontWeight: 600,
        padding: '8px 6px',
        borderBottom: '1px solid var(--hairline)',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </th>
  );
}
function Td({ children, right = false, mono = false, colSpan, style }: any) {
  return (
    <td
      colSpan={colSpan}
      style={{
        textAlign: right ? 'right' : 'left',
        fontFamily: mono ? 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace' : undefined,
        padding: '8px 6px',
        borderBottom: '1px solid var(--hairline)',
        verticalAlign: 'top',
        ...style,
      }}
    >
      {children}
    </td>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: any;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.4)',
        display: 'grid',
        placeItems: 'center',
        padding: 16,
        zIndex: 2000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--panel)',
          border: '1px solid var(--hairline)',
          borderRadius: 12,
          width: 'min(720px, 100%)',
          maxHeight: '90vh',
          overflow: 'auto',
          padding: 16,
          boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <h3 style={{ margin: 0 }}>{title}</h3>
          <Button variant="primary" onClick={onClose}>
            Close
          </Button>
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
