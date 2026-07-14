type PresenceRecord = {
  online: boolean;
  lastSeenAt: string | null;
  connectionCount: number;
};

const presenceMap = new Map<string, PresenceRecord>();

export function markUserOnline(userId: string) {
  const existing = presenceMap.get(userId);
  const connectionCount = (existing?.connectionCount ?? 0) + 1;

  const record: PresenceRecord = {
    online: true,
    lastSeenAt: existing?.lastSeenAt ?? null,
    connectionCount,
  };

  presenceMap.set(userId, record);

  return {
    online: true,
    lastSeenAt: record.lastSeenAt,
  };
}

export function markUserOffline(userId: string) {
  const existing = presenceMap.get(userId);
  const connectionCount = Math.max((existing?.connectionCount ?? 1) - 1, 0);

  if (connectionCount > 0) {
    const record: PresenceRecord = {
      online: true,
      lastSeenAt: existing?.lastSeenAt ?? null,
      connectionCount,
    };

    presenceMap.set(userId, record);

    return {
      online: true,
      lastSeenAt: record.lastSeenAt,
    };
  }

  const lastSeenAt = new Date().toISOString();
  const record: PresenceRecord = {
    online: false,
    lastSeenAt,
    connectionCount: 0,
  };

  presenceMap.set(userId, record);

  return {
    online: false,
    lastSeenAt,
  };
}

export function getUserPresence(userId: string) {
  const record = presenceMap.get(userId);

  if (!record) {
    return {
      online: false,
      lastSeenAt: null,
    };
  }

  return {
    online: record.online,
    lastSeenAt: record.lastSeenAt,
  };
}