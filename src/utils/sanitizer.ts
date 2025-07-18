import DOMPurify from 'dompurify'

// Configuration DOMPurify
const purifyConfig = {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
  ALLOWED_ATTR: [],
  ALLOW_DATA_ATTR: false,
  FORBID_SCRIPT: true,
  FORBID_TAGS: ['script', 'object', 'embed', 'link', 'style'],
  FORBID_ATTR: ['onerror', 'onclick', 'onload', 'onmouseover']
}

export class SecuritySanitizer {
  // Nettoyer le HTML
  static sanitizeHTML(dirty: string): string {
    if (!dirty || typeof dirty !== 'string') return ''
    return DOMPurify.sanitize(dirty, purifyConfig)
  }

  // Nettoyer le texte brut
  static sanitizeText(text: string): string {
    if (!text || typeof text !== 'string') return ''
    
    return text
      .replace(/[<>]/g, '') // Supprimer < et >
      .replace(/javascript:/gi, '') // Supprimer javascript:
      .replace(/on\w+=/gi, '') // Supprimer les event handlers
      .replace(/data:/gi, '') // Supprimer data: URLs
      .trim()
  }

  // Échapper pour utilisation en SQL (même si on utilise des requêtes préparées)
  static escapeSql(text: string): string {
    if (!text || typeof text !== 'string') return ''
    return text.replace(/'/g, "''").replace(/;/g, '\\;')
  }

  // Nettoyer les noms de fichiers
  static sanitizeFilename(filename: string): string {
    if (!filename || typeof filename !== 'string') return 'unnamed'
    
    return filename
      .replace(/[^a-zA-Z0-9.-]/g, '_') // Remplacer caractères spéciaux
      .replace(/\.{2,}/g, '.') // Éviter les .. (directory traversal)
      .substring(0, 255) // Limiter la longueur
  }

  // Valider les URLs
  static validateURL(url: string): boolean {
    try {
      const urlObj = new URL(url)
      // Autoriser seulement HTTPS et certains domaines
      const allowedProtocols = ['https:']
      const allowedDomains = [
        'api.suno.ai',
        'yancoxnhqpkexgrek.supabase.co',
        'cdnjs.cloudflare.com'
      ]
      
      return allowedProtocols.includes(urlObj.protocol) &&
             allowedDomains.some(domain => urlObj.hostname.endsWith(domain))
    } catch {
      return false
    }
  }

  // Détecter les tentatives d'injection
  static detectInjection(input: string): boolean {
    const injectionPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /eval\s*\(/i,
      /expression\s*\(/i,
      /vbscript:/i,
      /data:text\/html/i
    ]
    
    return injectionPatterns.some(pattern => pattern.test(input))
  }
}
