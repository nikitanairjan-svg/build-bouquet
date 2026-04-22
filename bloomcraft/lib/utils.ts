// utils.ts — shared utility functions

import { type ClassValue, clsx } from "clsx";

/** Merge Tailwind class names safely (requires: npm install clsx) */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/** Generate a unique instance ID for placed flowers */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Format a price in pence to a GBP string */
export function formatPrice(pence: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(pence / 100);
}

/** Clamp a number between min and max */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
