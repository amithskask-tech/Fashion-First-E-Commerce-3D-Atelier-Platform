// ============================================================================
// Measurement Unit Conversion Utilities
// Internal canonical representation: Millimetres (integer) and Kilograms (float)
// ============================================================================

export const MM_PER_INCH = 25.4;
export const LBS_PER_KG = 2.20462;

/**
 * Converts inches to millimetres, rounded to nearest integer millimetre.
 */
export function inchesToMm(inches: number): number {
  if (isNaN(inches) || inches < 0) return 0;
  return Math.round(inches * MM_PER_INCH);
}

/**
 * Converts millimetres to inches, rounded to 1 decimal place (or specified decimals).
 */
export function mmToInches(mm: number, decimals: number = 1): number {
  if (isNaN(mm) || mm < 0) return 0;
  const val = mm / MM_PER_INCH;
  const factor = Math.pow(10, decimals);
  return Math.round(val * factor) / factor;
}

/**
 * Converts pounds (lbs) to kilograms (kg), rounded to 1 decimal place.
 */
export function lbsToKg(lbs: number): number {
  if (isNaN(lbs) || lbs < 0) return 0;
  return Math.round((lbs / LBS_PER_KG) * 10) / 10;
}

/**
 * Converts kilograms (kg) to pounds (lbs), rounded to 1 decimal place.
 */
export function kgToLbs(kg: number): number {
  if (isNaN(kg) || kg < 0) return 0;
  return Math.round((kg * LBS_PER_KG) * 10) / 10;
}

/**
 * Formats a canonical mm value for display in the chosen unit.
 */
export function formatLength(mm: number, unit: 'metric' | 'imperial'): string {
  if (unit === 'imperial') {
    return `${mmToInches(mm, 1)}"`;
  }
  return `${(mm / 10).toFixed(1)} cm`;
}

/**
 * Formats a canonical kg value for display in the chosen unit.
 */
export function formatWeight(kg: number, unit: 'metric' | 'imperial'): string {
  if (unit === 'imperial') {
    return `${kgToLbs(kg)} lbs`;
  }
  return `${kg.toFixed(1)} kg`;
}
