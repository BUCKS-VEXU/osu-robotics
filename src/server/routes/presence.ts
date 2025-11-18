// presence.ts (ESM)
import { Router } from 'express';
import { z } from 'zod';
import type { Request, Response } from 'express';

import { requireAuth } from '../auth.js';
import { prisma } from '../prisma.js';
import type { ActiveSessionRecord } from '../activeSessionsCache.js';
import {
  ensureActiveSessionsHydrated,
  getActiveSessionsSnapshot,
  refreshActiveSessionsCache,
  upsertActiveSessionRecord,
} from '../activeSessionsCache.js';
import { startAutokickLoop, sweepAutokickedSessions } from '../autokick.js';

interface Session {
  id: string;
  since: string;
  note: string | null;
  member: {
    id: string;
    handle: string;
    avatarUrl: string | null;
    isExec: boolean;
  };
  location: {
    id: string;
    name: string;
  };
}

const clients = new Set<Response>();

const memberSelect = { id: true, handle: true, avatarUrl: true, isExec: true } as const;
const locationSelect = { id: true, name: true } as const;

type ActAsResult = { id: string };
async function resolveActingMember(req: Request): Promise<ActAsResult> {
  const authed = req.user as Express.User | undefined;
  if (authed && authed.id && authed.id !== 'presence-bot') return { id: authed.id };

  const fromHeader = (req.get('x-member-id') || '').trim();
  const fromBody =
    typeof (req.body as any)?.memberId === 'string' ? (req.body as any).memberId.trim() : '';
  const fromQuery =
    typeof (req.query as any)?.memberId === 'string' ? (req.query as any).memberId.trim() : '';
  const memberId = fromHeader || fromBody || fromQuery;
  if (!memberId) {
    const err: any = new Error('memberId required for bot access');
    err.status = 400;
    throw err;
  }
  const exists = await prisma.member.findUnique({ where: { id: memberId }, select: { id: true } });
  if (!exists) {
    const err: any = new Error('member not found');
    err.status = 404;
    throw err;
  }
  return { id: memberId };
}

function mapRecordToPresence(row: ActiveSessionRecord): Session {
  return {
    id: row.id,
    since: row.checkInAt.toISOString(),
    note: row.notes,
    member: row.member
      ? {
          id: row.member.id,
          handle: row.member.handle ?? row.member.id,
          avatarUrl: row.member.avatarUrl ?? null,
          isExec: row.member.isExec ?? false,
        }
      : {
          id: row.memberId,
          handle: row.memberId,
          avatarUrl: null,
          isExec: false,
        },
    location: row.location
      ? {
          id: row.location.id,
          name: row.location.name ?? row.location.id,
        }
      : {
          id: row.locationId,
          name: row.locationId,
        },
  };
}

function currentPresenceSessions(): Session[] {
  return getActiveSessionsSnapshot()
    .filter((rec) => rec.location?.active !== false)
    .map(mapRecordToPresence);
}

// Hydrate cache on server startup
await ensureActiveSessionsHydrated().catch((e) => {
  console.error('Failed to hydrate activeCache on startup:', e);
});
// Run an initial autokick sweep on boot, then keep sweeping every minute.
await sweepAutokickedSessions()
  .then(({ closed }) => {
    if (closed) {
      pushPresenceActiveUpdate().catch(() => {
        /* ignore */
      });
    }
  })
  .catch((e) => console.error('Autokick sweep failed during boot:', e));

startAutokickLoop(async (sessions) => {
  if (sessions.length === 0) return;
  console.info(`[autokick] Closed ${sessions.length} idle sessions.`);
  await pushPresenceActiveUpdate();
});

const presence = Router();

// Everything below requires a logged-in Discord user
presence.use(requireAuth);

presence.get('/locations', async (_, res: Response) => {
  const locations = await prisma.location.findMany({
    where: { active: true },
    orderBy: { name: 'asc' },
  });
  res.json({ locations });
});

function broadcastActive() {
  const payload = `data: ${JSON.stringify({ active: currentPresenceSessions() })}\n\n`;
  for (const res of clients) res.write(payload);
}

export async function pushPresenceActiveUpdate(session?: any) {
  if (session) upsertActiveSessionRecord(session);
  else await refreshActiveSessionsCache();
  broadcastActive();
}

// Active member stream
presence.get('/stream', async (req: Request, res: Response) => {
  await ensureActiveSessionsHydrated();
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  // Immediately send current state so clients render instantly
  res.write(`data: ${JSON.stringify({ active: currentPresenceSessions() })}\n\n`);

  const ping = setInterval(() => res.write(': ping\n\n'), 25000);
  clients.add(res);

  req.on('close', () => {
    clearInterval(ping);
    clients.delete(res);
  });
});

presence.get('/active', async (_, res: Response) => {
  try {
    await ensureActiveSessionsHydrated();
    res.json({ active: currentPresenceSessions() });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to load active sessions' });
  }
});

const TapQuery = z.object({
  loc: z.string().trim().optional(),
});

const DEBOUNCE_MS = 3000;

presence.get('/tap', async (req: Request, res: Response) => {
  let actor: ActAsResult;
  try {
    actor = await resolveActingMember(req);
  } catch (err: any) {
    return res.status(err.status || 400).json({ error: err.message || 'member resolution failed' });
  }
  const userId = actor.id;
  const now = new Date();

  // 1) Resolve location
  const parsed = TapQuery.safeParse(req.query);
  const locStr = parsed.success ? parsed.data.loc : undefined;
  if (!locStr) return res.status(404).json({ error: 'no location query' });

  const location = await prisma.location.findFirst({
    where: { active: true, OR: [{ id: locStr }, { name: locStr }] },
    select: { id: true, name: true },
  });
  if (!location) return res.status(404).json({ error: 'location not found' });

  // 2) Get latest session-like state (same idea as /status)
  const open = await prisma.session.findFirst({
    where: { memberId: userId, checkOutAt: null },
    orderBy: { checkInAt: 'desc' },
    include: {
      location: { select: locationSelect },
      member: { select: memberSelect },
    },
  });

  // 3) Debounce
  const lastEvent = open
    ? open.checkInAt
    : (
        await prisma.session.findFirst({
          where: { memberId: userId },
          orderBy: [{ checkOutAt: 'desc' }, { checkInAt: 'desc' }],
          select: { checkOutAt: true, checkInAt: true },
        })
      )?.checkOutAt || null;

  if (lastEvent && now.getTime() - lastEvent.getTime() < DEBOUNCE_MS) {
    return res.status(200).json({
      debounced: true,
      isIn: !open,
      location,
      since: Date.now(),
      user: { id: userId },
    });
  }

  // 4) Toggle
  let updatedSession: any;
  if (open) {
    updatedSession = await prisma.session.update({
      where: { id: open.id },
      data: { checkOutAt: now },
      include: {
        member: { select: memberSelect },
        location: { select: locationSelect },
      },
    });
  } else {
    updatedSession = await prisma.session.create({
      data: { memberId: userId, locationId: location.id },
      include: {
        member: { select: memberSelect },
        location: { select: locationSelect },
      },
    });
  }

  await pushPresenceActiveUpdate(updatedSession);

  res.json({
    debounced: false,
    isIn: !open,
    location,
    since: Date.now(),
    user: { id: userId },
  });
});

presence.post('/checkin', async (req: Request, res: Response) => {
  let actor: ActAsResult;
  try {
    actor = await resolveActingMember(req);
  } catch (err: any) {
    return res.status(err.status || 400).json({ error: err.message || 'member resolution failed' });
  }

  const memberId = actor.id;
  const { locationId, notes } = req.body;
  if (!memberId || !locationId)
    return res.status(400).json({ error: 'memberId/locationId required' });

  const session = await prisma.session.create({
    data: { memberId, locationId, notes: notes ?? null },
    include: { member: { select: memberSelect }, location: { select: locationSelect } },
  });

  await pushPresenceActiveUpdate(session);

  res.json({ ok: true, session: { id: session.id, checkInAt: session.checkInAt } });
});

presence.post('/checkout', async (req: Request, res: Response) => {
  let actor: ActAsResult;
  try {
    actor = await resolveActingMember(req);
  } catch (err: any) {
    return res.status(err.status || 400).json({ error: err.message || 'member resolution failed' });
  }

  const userId = actor.id;
  const open = await prisma.session.findFirst({
    where: { memberId: userId, checkOutAt: null },
  });
  if (!open) return res.status(404).json({ error: 'No open session' });

  const closed = await prisma.session.update({
    where: { id: open.id },
    data: { checkOutAt: new Date() },
    include: { member: { select: memberSelect }, location: { select: locationSelect } },
  });

  await pushPresenceActiveUpdate(closed);

  res.json(closed);
});

presence.get('/status', async (req: Request, res: Response) => {
  let actor: ActAsResult;
  try {
    actor = await resolveActingMember(req);
  } catch (err: any) {
    return res.status(err.status || 400).json({ error: err.message || 'member resolution failed' });
  }

  const userId = actor.id;
  const open = await prisma.session.findFirst({
    where: { memberId: userId, checkOutAt: null },
    include: { location: true },
  });

  res.json({
    isIn: !!open,
    location: open?.locationId || null,
    since: open?.checkInAt || null,
    user: { id: userId },
  });
});

export default presence;
