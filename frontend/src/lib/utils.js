import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const LAKH = 100000;
const CRORE = 10000000;

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPackage(amount) {
  if (amount == null || Number.isNaN(amount)) return '—';
  if (amount >= LAKH) return `₹${(amount / LAKH).toFixed(1)}L`;
  return formatCurrency(amount);
}

/**
 * Normalize placement/fee values to annual rupees.
 * Handles annual ₹ (3650000), decimal LPA (36.5), and legacy LPA×10 (336 → 33.6 LPA).
 */
export function normalizeAnnualRupees(amount) {
  const n = Number(amount);
  if (amount == null || Number.isNaN(n) || n <= 0) return null;

  if (n >= LAKH) return n;
  if (n < 100) return Math.round(n * LAKH);
  if (n < 1000) return Math.round((n / 10) * LAKH);

  return n;
}

/** Normalize to LPA number (e.g. 3650000 → 36.5). */
export function toLPA(amount) {
  const annual = normalizeAnnualRupees(amount);
  if (annual == null) return null;
  return annual / LAKH;
}

/** Normalize to crore number (e.g. 11500000 → 1.15). */
export function toCrores(amount) {
  const annual = normalizeAnnualRupees(amount);
  if (annual == null) return null;
  return annual / CRORE;
}

/** Convert LPA form input to annual rupees for DB storage. */
export function lpaToAnnualRupees(lpa) {
  return normalizeAnnualRupees(lpa);
}

/** Convert crore form input to annual rupees for DB storage. */
export function croresToAnnualRupees(cr) {
  const n = Number(cr);
  if (cr == null || Number.isNaN(n) || n <= 0) return null;
  if (n >= CRORE) return Math.round(n);
  if (n < 100) return Math.round(n * CRORE);
  return Math.round(n);
}

/** e.g. 3650000 → ₹36.5 LPA */
export function formatLPA(amount) {
  const lpa = toLPA(amount);
  if (lpa == null) return '—';
  return `₹${lpa.toFixed(1)} LPA`;
}

/** e.g. 11500000 → ₹1.15 Cr */
export function formatCrore(amount) {
  const cr = toCrores(amount);
  if (cr == null) return '—';
  return `₹${cr.toFixed(2)} Cr`;
}

/** @deprecated Use formatCrore */
export const formatCr = formatCrore;

/** Highest package: < ₹1 Cr → LPA, >= ₹1 Cr → Cr (e.g. 8500000 → ₹85.0 LPA, 11500000 → ₹1.15 Cr). */
export function formatHighestPackage(amount) {
  const annual = normalizeAnnualRupees(amount);
  if (annual == null) return '—';
  if (annual >= CRORE) return formatCrore(annual);
  return formatLPA(annual);
}

/** e.g. 2300000 → ₹23.0 Lakhs */
export function formatFees(amount) {
  const annual = normalizeAnnualRupees(amount);
  if (annual == null) return '—';
  const lakhs = annual / LAKH;
  return `₹${lakhs.toFixed(1)} Lakhs`;
}
