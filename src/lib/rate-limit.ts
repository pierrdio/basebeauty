type AttemptRecord = {
  count: number;
  windowStartedAt: number;
  lockedUntil: number | null;
};

const store = new Map<string, AttemptRecord>();

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;
const LOCKOUT_MS = 15 * 60 * 1000;

function getFreshRecord(key: string, now: number): AttemptRecord {
  const existing = store.get(key);

  if (!existing) {
    return { count: 0, windowStartedAt: now, lockedUntil: null };
  }

  if (existing.lockedUntil && existing.lockedUntil <= now) {
    store.delete(key);
    return { count: 0, windowStartedAt: now, lockedUntil: null };
  }

  if (
    !existing.lockedUntil &&
    now - existing.windowStartedAt > WINDOW_MS
  ) {
    store.delete(key);
    return { count: 0, windowStartedAt: now, lockedUntil: null };
  }

  return existing;
}

export function checkLoginRateLimit(key: string): {
  allowed: boolean;
  retryAfterSeconds?: number;
  remainingAttempts: number;
} {
  const now = Date.now();
  const record = getFreshRecord(key, now);

  if (record.lockedUntil && record.lockedUntil > now) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((record.lockedUntil - now) / 1000),
      remainingAttempts: 0,
    };
  }

  return {
    allowed: true,
    remainingAttempts: Math.max(0, MAX_ATTEMPTS - record.count),
  };
}

export function recordFailedLoginAttempt(key: string): {
  locked: boolean;
  retryAfterSeconds?: number;
  remainingAttempts: number;
} {
  const now = Date.now();
  const record = getFreshRecord(key, now);
  const nextCount = record.count + 1;

  if (nextCount >= MAX_ATTEMPTS) {
    const lockedUntil = now + LOCKOUT_MS;
    store.set(key, {
      count: nextCount,
      windowStartedAt: record.windowStartedAt,
      lockedUntil,
    });

    return {
      locked: true,
      retryAfterSeconds: Math.ceil(LOCKOUT_MS / 1000),
      remainingAttempts: 0,
    };
  }

  store.set(key, {
    count: nextCount,
    windowStartedAt: record.count === 0 ? now : record.windowStartedAt,
    lockedUntil: null,
  });

  return {
    locked: false,
    remainingAttempts: Math.max(0, MAX_ATTEMPTS - nextCount),
  };
}

export function resetLoginRateLimit(key: string) {
  store.delete(key);
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0]?.trim() || 'unknown';
  }

  return (
    request.headers.get('x-real-ip') ||
    request.headers.get('cf-connecting-ip') ||
    'unknown'
  );
}
