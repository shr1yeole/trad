/**
 * Timezone utility for TradeMind AI
 * All date operations use Asia/Kolkata (IST, UTC+5:30)
 */

export const IST_TIMEZONE = 'Asia/Kolkata'

/**
 * Returns the current date in IST as a Date object (time set to 00:00:00 IST)
 */
export function nowIST(): Date {
  const now = new Date()
  return toISTDay(now)
}

/**
 * Converts a UTC Date to a Date that represents IST midnight for the same IST calendar day.
 * Useful for "today/this week/this month" comparisons.
 */
export function toISTDay(date: Date): Date {
  const iso = toISTDateString(date)
  // Parse the IST date as a UTC midnight so arithmetic works consistently
  return new Date(iso + 'T00:00:00+05:30')
}

/**
 * Returns YYYY-MM-DD in IST for the given Date (or now if not provided).
 */
export function toISTDateString(date?: Date): string {
  const d = date ?? new Date()
  return d.toLocaleDateString('en-CA', { timeZone: IST_TIMEZONE }) // en-CA gives YYYY-MM-DD
}

/**
 * Returns YYYY-MM in IST for the given Date (or now if not provided).
 */
export function toISTMonthString(date?: Date): string {
  return toISTDateString(date).slice(0, 7)
}

/**
 * Returns the start of the current IST week (7 days ago at IST midnight).
 */
export function weekStartIST(): Date {
  const now = new Date()
  const nowISTMs = now.getTime() + (5.5 * 60 * 60 * 1000) // shift to IST epoch
  const weekAgoMs = nowISTMs - 7 * 24 * 60 * 60 * 1000
  // Convert back to UTC-based Date for comparison
  return new Date(weekAgoMs - (5.5 * 60 * 60 * 1000))
}

/**
 * Returns the IST hour (0-23) of a given Date.
 */
export function toISTHour(date: Date): number {
  const hour = Number(date.toLocaleString('en-US', { hour: 'numeric', hour12: false, timeZone: IST_TIMEZONE }))
  return isNaN(hour) ? 0 : hour % 24
}

/**
 * Returns the IST day-of-week index (0=Sunday, 6=Saturday) of a given Date.
 */
export function toISTDayOfWeek(date: Date): number {
  const day = date.toLocaleDateString('en-US', { weekday: 'long', timeZone: IST_TIMEZONE })
  const map: Record<string, number> = { Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 }
  return map[day] ?? 0
}

/**
 * Formats a Date for display in IST with the given options.
 */
export function formatIST(date: Date, options: Intl.DateTimeFormatOptions = {}): string {
  return date.toLocaleString('en-IN', { timeZone: IST_TIMEZONE, ...options })
}

/**
 * Returns current IST time as HH:MM string (for chat timestamps, etc.)
 */
export function nowISTTimeString(): string {
  return formatIST(new Date(), { hour: '2-digit', minute: '2-digit', hour12: false })
}

/**
 * Returns today's IST date string (YYYY-MM-DD) – convenience wrapper
 */
export function todayIST(): string {
  return toISTDateString()
}

/**
 * Returns current month's IST YYYY-MM string – convenience wrapper
 */
export function thisMonthIST(): string {
  return toISTMonthString()
}

/**
 * Converts a Date to YYYY-MM-DD in IST, used for date grouping throughout the app.
 */
export function dateToISTString(d: Date): string {
  if (!d || isNaN(d.getTime()) || d.getTime() === 0) return ''
  return toISTDateString(d)
}

/**
 * Gets the current IST date string for use as default value in date inputs (YYYY-MM-DD)
 */
export function defaultDateIST(): string {
  return toISTDateString()
}

/**
 * Returns the IST hours:minutes representation of a given Date (HH:MM)
 */
export function toISTHoursMinString(date: Date): string {
  const hours = Number(date.toLocaleString('en-US', { hour: 'numeric', hour12: false, timeZone: IST_TIMEZONE }))
  const minutes = Number(date.toLocaleString('en-US', { minute: 'numeric', timeZone: IST_TIMEZONE }))
  const cleanHours = isNaN(hours) ? 0 : hours % 24
  const cleanMinutes = isNaN(minutes) ? 0 : minutes
  return `${cleanHours.toString().padStart(2, '0')}:${cleanMinutes.toString().padStart(2, '0')}`
}

