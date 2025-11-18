import { prisma } from './prisma.js';

export type ActiveSessionRecord = {
  id: string;
  memberId: string;
  locationId: string;
  checkInAt: Date;
  notes: string | null;
  member?: {
    id: string;
    handle?: string | null;
    avatarUrl?: string | null;
    isExec?: boolean | null;
  };
  location?: {
    id: string;
    name?: string | null;
    active?: boolean | null;
  };
};

const cache = new Map<string, ActiveSessionRecord>();
let hydrated = false;

function normalize(session: any): ActiveSessionRecord {
  return {
    id: session.id,
    memberId: session.memberId,
    locationId: session.locationId,
    checkInAt:
      session.checkInAt instanceof Date ? session.checkInAt : new Date(session.checkInAt ?? Date.now()),
    notes: session.notes ?? null,
    member: session.member
      ? {
          id: session.member.id,
          handle: session.member.handle ?? session.member.id,
          avatarUrl: session.member.avatarUrl ?? null,
          isExec: session.member.isExec ?? null,
        }
      : undefined,
    location: session.location
      ? {
          id: session.location.id,
          name: session.location.name ?? session.location.id,
          active: 'active' in session.location ? session.location.active : undefined,
        }
      : undefined,
  };
}

async function hydrate() {
  const rows = await prisma.session.findMany({
    where: { checkOutAt: null },
    include: {
      member: { select: { id: true, handle: true, avatarUrl: true, isExec: true } },
      location: { select: { id: true, name: true, active: true } },
    },
    orderBy: { checkInAt: 'desc' },
  });
  cache.clear();
  for (const row of rows) {
    cache.set(row.id, normalize(row));
  }
  hydrated = true;
}

export async function ensureActiveSessionsHydrated() {
  if (!hydrated) await hydrate();
}

export async function refreshActiveSessionsCache() {
  await hydrate();
  return getActiveSessionsSnapshot();
}

export function getActiveSessionsSnapshot(): ActiveSessionRecord[] {
  return Array.from(cache.values()).sort((a, b) => b.checkInAt.getTime() - a.checkInAt.getTime());
}

export function upsertActiveSessionRecord(session: any) {
  if (!session) return;
  if (session.checkOutAt) {
    cache.delete(session.id);
    return;
  }
  cache.set(session.id, normalize(session));
}

export function removeActiveSessionRecord(id: string) {
  cache.delete(id);
}
