// lib/utils/date.ts

export const toIsoFromInput = (birthday: string) => new Date(birthday).toISOString();

/**
 * Parses any date input (Date object, ISO string, or timestamp) into a valid JS Date object.
 * Returns null if the input is invalid.
 */
export function parseDate(dateInput: Date | string | number | null | undefined): Date | null {
  if (!dateInput) return null;
  const d = new Date(dateInput);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Formats a date for standard UI display (e.g., "12 Oct 2023, 09:00 AM")
 */
export function formatForDisplay(dateInput: Date | string | number | null | undefined): string {
  const d = parseDate(dateInput);
  if (!d) return 'N/A';

  return d.toLocaleString('en-NG', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

/**
 * Formats a date specifically for <input type="datetime-local" />
 * which expects the exact format: "YYYY-MM-DDTHH:mm"
 */
export function formatForInput(dateInput: Date | string | number | null | undefined): string {
  const d = parseDate(dateInput);
  if (!d) return '';

  // Get local date components to construct the string, since toISOString() uses UTC
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Calculates the duration between two dates in a human-readable format.
 * E.g., "7d 8h" or "4h"
 */
export function calculateDuration(startInput: Date | string | null, endInput: Date | string | null): string {
  const start = parseDate(startInput);
  const end = parseDate(endInput);

  if (!start || !end) return 'N/A';

  const diffMs = end.getTime() - start.getTime();
  if (diffMs <= 0) return '0h';

  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  const diffHours = Math.floor((diffMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));

  if (diffDays > 0) {
    return `${diffDays}d ${diffHours}h`;
  }
  return `${diffHours}h`;
}
