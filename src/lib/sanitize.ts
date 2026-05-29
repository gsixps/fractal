/**
 * Basic HTML/XSS sanitization for user-generated content
 * Strips dangerous HTML tags while preserving safe markdown-like formatting
 */
export function sanitizeInput(input: string): string {
  // Remove script tags and their content
  let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  // Remove event handlers (onclick, onload, etc.)
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*(['"])[^'"]*\1/gi, '')
  // Remove javascript: URLs
  sanitized = sanitized.replace(/javascript\s*:/gi, '')
  // Remove data: URLs that could contain HTML
  sanitized = sanitized.replace(/data\s*:\s*text\/html/gi, '')
  // Remove vbscript:
  sanitized = sanitized.replace(/vbscript\s*:/gi, '')
  return sanitized.trim()
}

/**
 * Sanitize a string to be safe for use in HTML attributes
 */
export function sanitizeAttribute(input: string): string {
  return input.replace(/["'&<>]/g, (match) => {
    const entities: Record<string, string> = { '"': '&quot;', "'": '&#39;', '&': '&amp;', '<': '&lt;', '>': '&gt;' }
    return entities[match] || match
  })
}
