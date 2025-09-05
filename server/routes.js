// routes.js (ESM)
import { Router } from "express";
import { prisma } from "./prisma.js";

const router = Router();

// Middleware to fake auth (replace later w/ Discord OAuth)
router.use((req, _res, next) => {
  // For now just pretend userId = "test-user"
  req.userId = "test-user";
  next();
});

// POST /api/checkin { locationId }
router.post("/checkin", async (req, res) => {
  const { locationId } = req.body;
  const userId = req.userId;

  // Ensure location exists (or create on first use)
  let loc = await prisma.location.findUnique({ where: { id: locationId } });
  if (!loc) {
    loc = await prisma.location.create({ data: { id: locationId, name: locationId } });
  }

  // Prevent double-checkin
  const open = await prisma.session.findFirst({
    where: { memberId: userId, checkOutAt: null },
  });
  if (open) {
    return res.status(409).json({ error: "Already checked in", sessionId: open.id });
  }

  // Ensure member record exists
  await prisma.member.upsert({
    where: { id: userId },
    update: {},
    create: { id: userId, handle: userId },
  });

  const session = await prisma.session.create({
    data: { memberId: userId, locationId },
  });

  res.json(session);
});

// POST /api/checkout
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

// GET /api/status
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
  });
});

export default router;
