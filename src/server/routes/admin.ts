// server/routes/admin.ts (ESM)
import { Router } from 'express';
import { z } from 'zod';
import type { Request, Response, NextFunction } from 'express';

import { requireAuth } from '../auth.js';
import { prisma } from '../prisma.js';

// ---------- Types (mirrored to AdminPanel needs) ----------
type MemberLite = { id: string; handle?: string | null };
type LocLite = { id: string; name?: string | null };
type SessionDTO = {
  id: string;
  memberId: string;
  member?: MemberLite | null;
  location?: LocLite | null;
  checkInAt: string | null; // ISO strings for the frontend
  checkOutAt: string | null; // ISO strings for the frontend
  notes?: string | null;
};

// ---------- Admin guard ----------
// Assumes req.user is populated by your Passport/Discord middleware.
// If your Member table has isExec, we trust that here.
function requireExec(req: Request, res: Response, next: NextFunction) {
  const u: any = (req as any).user;
  if (u?.isExec || u?.role === 'admin' || u?.admin === true) return next();
  return res.status(401).json({ error: 'not exec' });
}

// ---------- DTO helpers ----------
function dtoSession(s: any): SessionDTO {
  return {
    id: s.id,
    memberId: s.memberId,
    member: s.member ? { id: s.member.id, handle: s.member.handle } : null,
    location: s.location ? { id: s.location.id, name: s.location.name } : null,
    checkInAt: s.checkInAt ? s.checkInAt.toISOString() : null,
    checkOutAt: s.checkOutAt ? s.checkOutAt.toISOString() : null,
    notes: s.notes ?? null,
  };
}

// ---------- Presence-style cache for ACTIVE sessions ----------
type ActiveCacheEntry = {
  id: string;
  memberId: string;
  locationId: string;
  checkInAt: Date;
  notes: string | null;
  // denormalized for quick admin panel list:
  member?: { id: string; handle: string; avatarUrl: string | null };
  location?: { id: string; name: string | null };
};

const activeCache = new Map<string, ActiveCacheEntry>(); // key = session.id
let activeCacheHydrated = false;

async function hydrateActiveCache() {
  const open = await prisma.session.findMany({
    where: { checkOutAt: null },
    include: { member: true, location: true },
  });
  activeCache.clear();
  for (const s of open) {
    activeCache.set(s.id, {
      id: s.id,
      memberId: s.memberId,
      locationId: s.locationId,
      checkInAt: s.checkInAt,
      notes: s.notes ?? null,
      member: s.member
        ? { id: s.member.id, handle: s.member.handle, avatarUrl: s.member.avatarUrl ?? null }
        : undefined,
      location: s.location ? { id: s.location.id, name: s.location.name ?? null } : undefined,
    });
  }
  activeCacheHydrated = true;
}

async function ensureActiveCache() {
  if (!activeCacheHydrated) await hydrateActiveCache();
}

function upsertActiveCache(s: any) {
  if (s.checkOutAt) {
    activeCache.delete(s.id);
    return;
  }
  activeCache.set(s.id, {
    id: s.id,
    memberId: s.memberId,
    locationId: s.locationId,
    checkInAt: s.checkInAt,
    notes: s.notes ?? null,
    member: s.member
      ? { id: s.member.id, handle: s.member.handle, avatarUrl: s.member.avatarUrl ?? null }
      : undefined,
    location: s.location ? { id: s.location.id, name: s.location.name ?? null } : undefined,
  });
}

// ---------- Optional: lightweight config cache ----------
let autokickMinutes = 60; // fallback default
async function loadAutokickFromDB() {
  try {
    // If you add a Settings table (see schema suggestions below), read it here.
    const s = await prisma.settings.findUnique({ where: { key: 'autokickMinutes' } });
    if (s?.valueInt != null) autokickMinutes = s.valueInt;
  } catch {
    // table may not exist yet
  }
}

// ---------- Router ----------
const admin = Router();

// Guard + health
admin.get('/ping', requireAuth, requireExec, (_req, res) => {
  res.json({ ok: true });
});

// ---------- Members & Locations (for GUI dropdowns) ----------
admin.get('/members', requireAuth, requireExec, async (_req, res) => {
  const members = await prisma.member.findMany({
    orderBy: { handle: 'asc' },
    select: { id: true, handle: true, avatarUrl: true, isExec: true, createdAt: true },
  });
  res.json({ members });
});

admin.get('/locations', requireAuth, requireExec, async (_req, res) => {
  const locations = await prisma.location.findMany({
    where: { active: true },
    orderBy: { name: 'asc' },
    select: { id: true, name: true, active: true },
  });
  res.json({ locations });
});

// ---------- Active sessions (cached) ----------
admin.get('/sessions/active', requireAuth, requireExec, async (_req, res) => {
  await ensureActiveCache();
  const list: SessionDTO[] = Array.from(activeCache.values())
    .sort((a, b) => b.checkInAt.getTime() - a.checkInAt.getTime())
    .map((s) =>
      dtoSession({
        ...s,
        // adapt for dtoSession
        location: s.location,
        member: s.member,
        checkOutAt: null,
      }),
    );
  res.json({ sessions: list, cached: true });
});

// ---------- End a session (checkout now) ----------
admin.post(
  '/sessions/:id/checkout',
  requireAuth,
  requireExec,
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const now = new Date();

    // Close the session
    const updated = await prisma.session.update({
      where: { id },
      data: { checkOutAt: now },
      include: { member: true, location: true },
    });

    upsertActiveCache(updated); // removes from cache because now closed
    res.json({ ok: true, session: dtoSession(updated) });
  },
);

// ---------- Edit session times (checkInAt / checkOutAt / notes) ----------
const editSchema = z.object({
  checkInAt: z.string().datetime().optional(),
  checkOutAt: z.string().datetime().nullable().optional(),
  notes: z.string().nullable().optional(),
});

admin.patch('/sessions/:id/time', requireAuth, requireExec, async (req, res) => {
  const { id } = req.params;
  const body = editSchema.safeParse(req.body);
  if (!body.success) return res.status(400).json({ ok: false, error: body.error.flatten() });

  const data: any = {};
  if (body.data.checkInAt !== undefined) data.checkInAt = new Date(body.data.checkInAt);
  if (body.data.checkOutAt !== undefined)
    data.checkOutAt = body.data.checkOutAt ? new Date(body.data.checkOutAt) : null;
  if (body.data.notes !== undefined) data.notes = body.data.notes;

  // (Optional) write an audit row if you add SessionEditLog (see suggestions)
  const updated = await prisma.session.update({
    where: { id },
    data,
    include: { member: true, location: true },
  });

  upsertActiveCache(updated); // update/remove cache entry appropriately
  res.json({ ok: true, session: dtoSession(updated) });
});

// ---------- Past sessions (paged + filters) ----------
const listSchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  memberId: z.string().optional(),
  locationId: z.string().optional(),
  q: z.string().optional(), // future: notes or handle search
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(200).default(50),
});

admin.get('/sessions/past', requireAuth, requireExec, async (req, res) => {
  const parsed = listSchema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { from, to, memberId, locationId, page, pageSize } = parsed.data;

  const where: any = { checkOutAt: { not: null } };
  if (from) where.checkInAt = { ...(where.checkInAt || {}), gte: new Date(from) };
  if (to) where.checkInAt = { ...(where.checkInAt || {}), lte: new Date(to) };
  if (memberId) where.memberId = memberId;
  if (locationId) where.locationId = locationId;

  const [total, rows] = await Promise.all([
    prisma.session.count({ where }),
    prisma.session.findMany({
      where,
      orderBy: { checkInAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { member: true, location: true },
    }),
  ]);

  res.json({
    total,
    page,
    pageSize,
    sessions: rows.map(dtoSession),
  });
});

// ---------- Create / seed session (optional helper for admin GUI) ----------
const createSchema = z.object({
  memberId: z.string(),
  locationId: z.string(),
  checkInAt: z.string().datetime().optional(), // default now
  notes: z.string().nullable().optional(),
});

admin.post('/sessions', requireAuth, requireExec, async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const created = await prisma.session.create({
    data: {
      memberId: parsed.data.memberId,
      locationId: parsed.data.locationId,
      checkInAt: parsed.data.checkInAt ? new Date(parsed.data.checkInAt) : new Date(),
      notes: parsed.data.notes ?? null,
    },
    include: { member: true, location: true },
  });

  upsertActiveCache(created);
  res.status(201).json({ ok: true, session: dtoSession(created) });
});

// ---------- Config (autokick minutes) ----------
const cfgSchema = z.object({ autokickMinutes: z.coerce.number().int().min(0) });

admin.get('/config', requireAuth, requireExec, async (_req, res) => {
  await loadAutokickFromDB(); // best effort
  res.json({ config: { autokickMinutes } });
});

admin.post('/config', requireAuth, requireExec, async (req, res) => {
  const parsed = cfgSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  autokickMinutes = parsed.data.autokickMinutes;
  try {
    // If you add Settings table:
    await prisma.settings.upsert({
      where: { key: 'autokickMinutes' },
      update: { valueInt: autokickMinutes },
      create: { key: 'autokickMinutes', valueInt: autokickMinutes },
    });
  } catch {
    // table may not exist yet; we still keep memory value
  }
  res.json({ ok: true, config: { autokickMinutes } });
});

// ---------- Hours: single member ----------
admin.get('/stats/member-hours', requireAuth, requireExec, async (req, res) => {
  const { memberId, from, to } = req.query as Record<string, string | undefined>;
  if (!memberId) return res.status(400).json({ error: 'memberId required' });

  const fromAt = from ? new Date(from) : new Date(0);
  const toAt = to ? new Date(to) : new Date();

  // fetch sessions that might overlap the window
  const rows = await prisma.session.findMany({
    where: {
      memberId,
      // session overlaps [fromAt, toAt] iff checkIn < toAt AND (checkOut OR now) > fromAt
      checkInAt: { lt: toAt },
      OR: [{ checkOutAt: null }, { checkOutAt: { gt: fromAt } }],
    },
    select: { checkInAt: true, checkOutAt: true },
  });

  let totalMs = 0;
  for (const s of rows) {
    const start = s.checkInAt.getTime();
    const end = (s.checkOutAt ?? new Date()).getTime();
    const seg = Math.max(0, Math.min(end, +toAt) - Math.max(start, +fromAt));
    totalMs += seg;
  }

  res.json({
    memberId,
    from: fromAt.toISOString(),
    to: toAt.toISOString(),
    totalMs,
    hours: +(totalMs / 3600000).toFixed(2),
  });
});

// ---------- Hours: leaderboard ----------
admin.get('/stats/leaderboard', requireAuth, requireExec, async (req, res) => {
  const { from, to, limit } = req.query as Record<string, string | undefined>;
  const fromAt = from ? new Date(from) : new Date(0);
  const toAt = to ? new Date(to) : new Date();
  const topN = Math.min(Math.max(parseInt(limit ?? '10', 10) || 10, 1), 100);

  // keep it simple & correct: fetch candidates then sum overlaps per member
  const rows = await prisma.session.findMany({
    where: {
      checkInAt: { lt: toAt },
      OR: [{ checkOutAt: null }, { checkOutAt: { gt: fromAt } }],
    },
    include: { member: { select: { id: true, handle: true } } },
  });

  const totals = new Map<
    string,
    { memberId: string; handle?: string | null; totalMs: number; sessions: number }
  >();
  for (const s of rows) {
    const start = s.checkInAt.getTime();
    const end = (s.checkOutAt ?? new Date()).getTime();
    const seg = Math.max(0, Math.min(end, +toAt) - Math.max(start, +fromAt));
    if (seg <= 0) continue;

    const key = s.member?.id ?? s['memberId']; // works even if include fails
    const cur = totals.get(key) ?? {
      memberId: key,
      handle: s.member?.handle,
      totalMs: 0,
      sessions: 0,
    };
    cur.totalMs += seg;
    cur.sessions += 1;
    totals.set(key, cur);
  }

  const board = Array.from(totals.values())
    .sort((a, b) => b.totalMs - a.totalMs)
    .slice(0, topN)
    .map((r) => ({ ...r, hours: +(r.totalMs / 3600000).toFixed(2) }));

  res.json({ from: fromAt.toISOString(), to: toAt.toISOString(), leaderboard: board });
});

// ---------- Boot-time hydration ----------
(async () => {
  await Promise.all([hydrateActiveCache(), loadAutokickFromDB()]);
})().catch(() => {
  /* ignore on boot */
});

export default admin;

