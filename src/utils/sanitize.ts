import DOMPurify from 'dompurify';

/**
 * Sanitizes HTML content to prevent XSS attacks
 * @param html - The HTML string to sanitize
 * @param options - Optional DOMPurify configuration
 * @returns Sanitized HTML string safe for rendering
 */
export function sanitizeHtml(html: string, options?: any): string {
  if (!html) return '';
  
  const defaultConfig: any = {
    // Allow basic formatting tags
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br', 'p', 'ul', 'ol', 'li', 'span', 'div'],
    // Allow safe attributes
    ALLOWED_ATTR: ['class'],
    // Remove any potentially dangerous content
    FORBID_ATTR: ['style', 'onclick', 'onload', 'onerror'],
    FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input', 'textarea'],
    // Keep whitespace
    KEEP_CONTENT: true,
    ...options
  };

  return DOMPurify.sanitize(html, defaultConfig) as unknown as string;
}

/**
 * Sanitizes plain text content and converts line breaks to <br> tags
 * @param text - The text to sanitize and format
 * @returns Sanitized HTML string with line breaks converted
 */
export function sanitizeTextWithBreaks(text: string): string {
  if (!text) return '';
  
  // First escape any HTML entities, then convert line breaks
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#x27;');
    
  // Convert line breaks to <br> tags
  return escaped.replace(/\n/g, '<br>');
}

/**
 * Creates a safe HTML object for dangerouslySetInnerHTML
 * @param html - The HTML string to sanitize
 * @param options - Optional DOMPurify configuration
 * @returns Object with __html property safe for React
 */
export function createSafeHtml(html: string, options?: any): { __html: string } {
  return {
    __html: sanitizeHtml(html, options)
  };
}
