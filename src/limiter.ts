import type { Connection } from "partykit/server";
import { GO_AWAY_SENTINEL, SLOW_DOWN_SENTINEL } from "./types";

type RateLimiter = { nextAllowedTime?: number; violations: number };
type RateLimitedConnection = Connection & RateLimiter;

/**
 * A simple per-connection rate limiter.
 * Doesn't prevent user from reconnecting.
 */
export function rateLimit(
  connection: Connection,
  cooldownMs: number,
  action: () => void
) {
  const sender = connection as RateLimitedConnection;

  // in case we hibernated, load the last known state
  if (!sender.nextAllowedTime) {
    const limiter = (sender.deserializeAttachment() ?? {}) as RateLimiter;
    sender.nextAllowedTime = limiter.nextAllowedTime ?? Date.now();
    sender.violations = limiter.violations ?? 0;
  }

  // if we're allowed to send a message, do it
  if (sender.nextAllowedTime <= Date.now()) {
    action();
    // reset rate limiter
    sender.nextAllowedTime = Date.now();
    sender.violations = 0;
  } else {
    // otherwise warn/ban the connection
    sender.violations++;
    if (sender.violations < 10) {
      sender.send(SLOW_DOWN_SENTINEL);
    } else if (sender.violations === 10) {
      sender.send(GO_AWAY_SENTINEL);
    } else {
      sender.close();
    }
  }

  // increment cooldown period
  sender.nextAllowedTime += cooldownMs;

  // save rate limiter state in case we hibernate
  sender.serializeAttachment({
    nextAllowedTime: sender.nextAllowedTime,
    violations: sender.violations,
  });
}
