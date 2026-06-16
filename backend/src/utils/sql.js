/** Coerce undefined to null for MySQL bind parameters */
export function sqlVal(value, fallback = null) {
  if (value === undefined) return fallback;
  if (value === '') return fallback;
  return value;
}
