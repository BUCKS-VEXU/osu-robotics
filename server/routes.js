// routes.js (ESM)
import { Router } from 'express';

import { requireAuth } from './auth.js';
import { prisma } from './prisma.js';

const router = Router();

router.get('/locations', async (_req, res) => {
  const locations = await prisma.location.findMany({
    where: { active: true },  // ← only actives
    orderBy: { name: 'asc' },
  });
  res.json({ locations });
});

// Everything below requires a logged-in Discord user
router.use(requireAuth);

router.get('/presence/active', async (_req, res) => {
  try {
    const rows = await prisma.session.findMany({
      where: {
        checkOutAt: null,
        location: { active: true },
      },
      orderBy: { checkInAt: 'desc' },
      include: {
        member:
          { select: { id: true, handle: true, avatarUrl: true, isExec: true } },
        location: { select: { id: true, name: true } },
      },
    });

    res.json({
      active: rows.map((s) => ({
        id: s.id,
        since: s.checkInAt.toISOString(),
        note: s.notes ?? null,
        member: s.member,      // { id, handle, isExec }
        location: s.location,  // { id, name }
      })),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to load active sessions' });
  }
});

router.post('/presence/checkin', async (req, res) => {
  const memberId = req.userId;  // however you attach auth
  const { locationId, notes } = req.body;

  if (!memberId || !locationId) {
    return res.status(400).json({ error: 'memberId/locationId required' });
  }

  // (optional) ensure member & location exist, end any stale session, etc.
  const session = await prisma.session.create({
    data: { memberId, locationId, notes: notes ?? null },
    select: { id: true, checkInAt: true },
  });

  // refresh avatar/handle in the background (non-blocking)
  // use `void` to intentionally ignore the promise and any rejections are
  // caught inside
  // void refreshDiscordProfile(memberId);

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
