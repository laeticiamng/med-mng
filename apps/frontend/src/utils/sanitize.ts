import DOMPurify from 'dompurify';

/**
 * Sanitize HTML and create safe object for dangerouslySetInnerHTML
 * @param html - Raw HTML string to sanitize
 * @returns Object with __html property containing sanitized HTML
 */
export function createSafeHtml(html: string): { __html: string } {
  return {
    __html: DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'u', 'br', 'p', 'span', 'div', 'ul', 'ol', 'li', 'a'],
      ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
    }),
  };
}

/**
 * Sanitize text while preserving line breaks
 * Converts newlines to <br> tags and sanitizes the result
 * @param text - Text to sanitize
 * @returns Object with __html property containing sanitized HTML with line breaks
 */
export function sanitizeTextWithBreaks(text: string): { __html: string } {
  const htmlWithBreaks = text.replace(/\n/g, '<br>');
  return createSafeHtml(htmlWithBreaks);
}
