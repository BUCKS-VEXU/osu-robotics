// routes.js (ESM)
import { Router } from 'express';
import { z } from 'zod';

import { requireAuth } from './auth.js';
import { prisma } from './prisma.js';

const clients = new Set();

let activeCache = [];
let activeCacheReady = false;

async function refreshActiveCache() {
  activeCache = await getActiveSessions();
  activeCacheReady = true;
}

async function getActiveSessions() {
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

const router = Router();

// Everything below requires a logged-in Discord user
router.use(requireAuth);

router.get('/presence/locations', async (_req, res) => {
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
router.get('/presence/stream', async (req, res) => {
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

router.get('/presence/active', async (_req, res) => {
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

router.get('/presence/tap', async (req, res) => {
  const userId = req.userId;
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

router.post('/presence/checkin', async (req, res) => {
  const memberId = req.userId;
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

router.post('/presence/checkout', async (req, res) => {
  const userId = req.userId;
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

router.get('/status', async (req, res) => {
  const userId = req.userId;
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

export default router;
