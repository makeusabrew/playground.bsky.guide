import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Gets a value from an object using a dot-notation path string
 * Example: getNestedValue({ a: { b: { c: 1 } } }, 'a.b.c') => 1
 */
export const getNestedValue = (obj: Record<string, unknown>, path: string): unknown => {
  if (!path) return obj

  const keys = path.split('.')
  let result: unknown = obj

  for (const key of keys) {
    if (result === null || result === undefined || typeof result !== 'object') {
      return undefined
    }
    result = (result as Record<string, unknown>)[key]
  }

  return result
}

/**
 * Checks if a value matches a filter condition
 * Supports partial string matches and exact matches for other types
 */
export const matchesFilter = (value: unknown, filterValue: string): boolean => {
  if (value === undefined || value === null) return false

  // For strings, do a case-insensitive partial match
  if (typeof value === 'string') {
    return value.toLowerCase().includes(filterValue.toLowerCase())
  }

  // For objects, stringify and do a partial match
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value).toLowerCase().includes(filterValue.toLowerCase())
    } catch {
      return false
    }
  }

  // For other types, convert to string and do a partial match
  return String(value).toLowerCase().includes(filterValue.toLowerCase())
}
