// routes.js (ESM)
import { Router } from "express";
import { prisma } from "./prisma.js";
import { requireAuth } from "./auth.js";

const router = Router();

router.get("/locations", async (_req, res) => {
  const locations = await prisma.location.findMany({
    where: { active: true },     // ← only actives
    orderBy: { name: "asc" },
  });
  res.json({ locations });
});

// Everything below requires a logged-in Discord user
router.use(requireAuth);

router.post("/checkin", async (req, res) => {
  const { locationId } = req.body;
  const userId = req.userId;

  let loc = await prisma.location.findUnique({ where: { id: locationId } });
  if (!loc) {
    return res.status(404).json({ error: "Location not found", locationId: locationId })
  }

  const open = await prisma.session.findFirst({
    where: { memberId: userId, checkOutAt: null },
  });
  if (open) {
    return res
      .status(409)
      .json({ error: "Already checked in", sessionId: open.id });
  }

  const session = await prisma.session.create({
    data: {
      memberId: userId,
      locationId,
    },
  });

  res.json(session);
});

router.post("/checkout", async (req, res) => {
  const userId = req.userId;
  const open = await prisma.session.findFirst({
    where: { memberId: userId, checkOutAt: null },
  });
  if (!open) return res.status(404).json({ error: "No open session" });

  const closed = await prisma.session.update({
    where: { id: open.id },
    data: { checkOutAt: new Date() },
  });

  res.json(closed);
});

router.get("/status", async (req, res) => {
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
