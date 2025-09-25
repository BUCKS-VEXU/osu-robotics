// presence.ts (ESM)
import { Router } from 'express';
import { z } from 'zod';
import type { Request, Response } from 'express';

import { requireAuth } from '../auth.js';
import { prisma } from '../prisma.js';

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

let activeCache: Session[] = [];
let activeCacheReady = false;

async function refreshActiveCache() {
  activeCache = await getActiveSessions();
  activeCacheReady = true;
}

async function getActiveSessions(): Promise<Session[]> {
  const rows = await prisma.session.findMany({
    where: {
      checkOutAt: null,
      location: { active: true },
    },
    orderBy: { checkInAt: 'desc' },
    include: {
      member: { select: { id: true, handle: true, avatarUrl: true, isExec: true } },
      location: { select: { id: true, name: true } },
    },
  });

  return rows.map((s) => ({
    id: s.id,
    since: s.checkInAt.toISOString(),
    note: s.notes ?? null,
    member: s.member,
    location: s.location,
  }));
}

// Hydrate cache on server startup
await refreshActiveCache().catch((e) => {
  console.error('Failed to hydrate activeCache on startup:', e);
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
  const payload = `data: ${JSON.stringify({ active: activeCache })}\n\n`;
  for (const res of clients) res.write(payload);
}

// Active member stream
presence.get('/stream', async (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  // Immediately send current state so clients render instantly
  res.write(`data: ${JSON.stringify({ active: activeCache })}\n\n`);

  const ping = setInterval(() => res.write(': ping\n\n'), 25000);
  clients.add(res);

  req.on('close', () => {
    clearInterval(ping);
    clients.delete(res);
  });
});

presence.get('/active', async (_, res: Response) => {
  try {
    if (!activeCacheReady) await refreshActiveCache();
    res.json({ active: activeCache });
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
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized: user not found' });
  }

  const userId = req.user.id;
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
    include: { location: { select: { id: true, name: true } } },
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
  if (open) {
    await prisma.session.update({
      where: { id: open.id },
      data: { checkOutAt: now },
      select: { id: true },
    });
  } else {
    await prisma.session.create({
      data: { memberId: userId, locationId: location.id },
    });
  }

  // Update cache once, then broadcast
  await refreshActiveCache();
  broadcastActive();

  res.json({
    debounced: false,
    isIn: !open,
    location,
    since: Date.now(),
    user: { id: userId },
  });
});

presence.post('/checkin', async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized: user not found' });
  }

  const memberId = req.user.id;
  const { locationId, notes } = req.body;
  if (!memberId || !locationId)
    return res.status(400).json({ error: 'memberId/locationId required' });

  const session = await prisma.session.create({
    data: { memberId, locationId, notes: notes ?? null },
    select: { id: true, checkInAt: true },
  });

  await refreshActiveCache();
  broadcastActive();

  res.json({ ok: true, session });
});

presence.post('/checkout', async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized: user not found' });
  }

  const userId = req.user.id;
  const open = await prisma.session.findFirst({
    where: { memberId: userId, checkOutAt: null },
  });
  if (!open) return res.status(404).json({ error: 'No open session' });

  const closed = await prisma.session.update({
    where: { id: open.id },
    data: { checkOutAt: new Date() },
  });

  await refreshActiveCache();
  broadcastActive();

  res.json(closed);
});

presence.get('/status', async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized: user not found' });
  }

  const userId = req.user.id;
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

