// autokick.ts - shared helpers for automatic session checkout
import { prisma } from './prisma.js';

let autokickMinutes = 60;
let loaded = false;
let sweeping = false;
let timer: ReturnType<typeof setInterval> | null = null;

export async function ensureAutokickLoaded() {
  if (loaded) return autokickMinutes;
  const s = await prisma.settings.findUnique({ where: { key: 'autokickMinutes' } });
  if (s?.valueInt != null) autokickMinutes = s.valueInt;
  loaded = true;
  return autokickMinutes;
}

export function getAutokickMinutes() {
  return autokickMinutes;
}

export async function setAutokickMinutes(minutes: number) {
  autokickMinutes = minutes;
  loaded = true;
  try {
    await prisma.settings.upsert({
      where: { key: 'autokickMinutes' },
      update: { valueInt: minutes },
      create: { key: 'autokickMinutes', valueInt: minutes },
    });
  } catch {
    /* ignore persistence errors */
  }
  return autokickMinutes;
}

const MINUTE_MS = 60_000;

type AutokickedSession = {
  id: string;
  checkInAt: Date;
  checkOutAt: Date;
  memberId: string;
  locationId: string;
};

export async function sweepAutokickedSessions(now = new Date()) {
  await ensureAutokickLoaded();
  if (autokickMinutes <= 0 || sweeping) return { closed: 0, sessions: [] as AutokickedSession[] };

  sweeping = true;
  try {
    const cutoff = new Date(now.getTime() - autokickMinutes * MINUTE_MS);
    const stale = await prisma.session.findMany({
      where: { checkOutAt: null, checkInAt: { lt: cutoff } },
      select: { id: true, memberId: true, locationId: true, checkInAt: true },
    });
    if (!stale.length) return { closed: 0, sessions: [] as AutokickedSession[] };

    const updates: AutokickedSession[] = [];
    for (const s of stale) {
      const autoCheckout = new Date(Math.min(now.getTime(), s.checkInAt.getTime() + autokickMinutes * MINUTE_MS));
      await prisma.session.update({
        where: { id: s.id },
        data: { checkOutAt: autoCheckout },
      });
      updates.push({
        id: s.id,
        memberId: s.memberId,
        locationId: s.locationId,
        checkInAt: s.checkInAt,
        checkOutAt: autoCheckout,
      });
    }
    return { closed: updates.length, sessions: updates };
  } finally {
    sweeping = false;
  }
}

export function startAutokickLoop(onClose?: (sessions: AutokickedSession[]) => Promise<void> | void) {
  if (timer) return;
  timer = setInterval(async () => {
    const { closed, sessions } = await sweepAutokickedSessions();
    if (closed && onClose) await onClose(sessions);
  }, MINUTE_MS);
}
