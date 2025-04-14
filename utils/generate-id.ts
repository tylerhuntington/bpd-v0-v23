/**
 * Generates a unique ID with an optional prefix
 * @param prefix Optional prefix for the ID
 * @returns A unique string ID
 */
export function generateId(prefix = "id"): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}
