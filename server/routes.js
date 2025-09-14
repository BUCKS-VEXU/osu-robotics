// routes.js (ESM)
import { Router } from 'express';

import { requireAuth } from './auth.js';
import { prisma } from './prisma.js';
import { z } from "zod";

const router = Router();

// Everything below requires a logged-in Discord user
router.use(requireAuth);

router.get('/presence/locations', async (_req, res) => {
  const locations = await prisma.location.findMany({
    where: { active: true },  // ← only actives
    orderBy: { name: 'asc' },
  });
  res.json({ locations });
});

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


const TapQuery = z.object({
  loc: z.string().trim().optional(), // location name or id (optional)
});

const DEBOUNCE_MS = 3000;

router.get("/presence/tap", async (req, res) => {
  const userId = req.userId; // set by requireAuth
  const now = new Date();

  // 1) Resolve location
  const parsed = TapQuery.safeParse(req.query);
  const locStr = parsed.success ? parsed.data.loc : undefined;

  if (!locStr) {
    // TODO probably shouldn't be a 404
    return res
      .status(404)
      .send(confirmPage({ state: "error", message: `No location provided` }));
  }

  let location =
    (await prisma.location.findFirst({
      where: { id: locStr, active: true },
      select: { id: true, name: true },
    }));

  if (!location) {
    return res
      .status(404)
      .send(confirmPage({ state: "error", message: `Unknown location: ${locStr}` }));
  }


  // 2) Get latest session-like state (same idea as /status)
  const open = await prisma.session.findFirst({
    where: { memberId: userId, checkOutAt: null },
    orderBy: { checkInAt: "desc" },
    include: { location: { select: { id: true, name: true } } },
  });

  // 3) Debounce: ignore if the last event was within DEBOUNCE_MS
  const lastEvent = open
    ? open.checkInAt
    : (
      await prisma.session.findFirst({
        where: { memberId: userId },
        orderBy: [{ checkOutAt: "desc" }, { checkInAt: "desc" }],
        select: { checkOutAt: true, checkInAt: true },
      })
    )?.checkOutAt || null;

  // Debounce
  if (lastEvent && now.getTime() - lastEvent.getTime() < DEBOUNCE_MS) {
    const locName = open?.location?.name ?? location?.name ?? "Unknown";
    return res
      .status(200)
      .send(confirmPage({ state: open ? "in" : "out", location: locName, debounced: true }));
  }

  // 4) Toggle
  if (open) {
    // --- CHECK OUT ---
    const closed = await prisma.session.update({
      where: { id: open.id },
      data: { checkOutAt: now },
      select: { id: true, location: { select: { name: true } } },
    });
    return res
      .status(200)
      .send(confirmPage({ state: "out", location: closed.location?.name || "Unknown" }));
  } else {
    // --- CHECK IN ---
    await prisma.session.create({
      data: {
        memberId: userId,
        locationId: location.id,
        // notes: optional
      },
    });
    return res.status(200).send(confirmPage({ state: "in", location: loc.name }));
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
