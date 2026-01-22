/**
 * Generate a unique message string for each test run.
 * Using a prefix + random suffix keeps messages identifiable in traces
 * while preventing cross-test collisions on the shared Ably channel.
 */
export function uniqueMessage(prefix = 'test'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
