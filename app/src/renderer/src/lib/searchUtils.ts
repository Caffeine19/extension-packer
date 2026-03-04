/**
 * Utility functions for enhanced search functionality
 */
import { debounce } from 'radash'

/**
 * Simple fuzzy search implementation
 * Returns a score between 0 and 1, where 1 is a perfect match
 */
export function fuzzyMatch(pattern: string, text: string): number {
  pattern = pattern.toLowerCase()
  text = text.toLowerCase()

  // Exact match gets highest score
  if (text.includes(pattern)) {
    return 1
  }

  // Calculate fuzzy match score
  let score = 0
  let patternIndex = 0

  for (let i = 0; i < text.length && patternIndex < pattern.length; i++) {
    if (text[i] === pattern[patternIndex]) {
      score += 1
      patternIndex++
    }
  }

  // Return ratio of matched characters
  return patternIndex === pattern.length ? score / pattern.length : 0
}

/**
 * Enhanced search function that searches multiple fields with fuzzy matching
 */
export function searchMultipleFields(
  query: string,
  fields: string[],
  threshold: number = 0.3
): boolean {
  if (!query.trim()) return true

  const normalizedQuery = query.toLowerCase().trim()

  // First try exact substring matches (highest priority)
  for (const field of fields) {
    if (field.toLowerCase().includes(normalizedQuery)) {
      return true
    }
  }

  // Then try fuzzy matching
  for (const field of fields) {
    const score = fuzzyMatch(normalizedQuery, field)
    if (score >= threshold) {
      return true
    }
  }

  return false
}

/**
 * Create a debounced signal setter for search functionality
 */
export function createDebouncedSetter<T>(
  setter: (value: T) => void,
  delay: number = 300
): (value: T) => void {
  return debounce({ delay }, setter)
}
