/**
 * Cookie Jar simple pour gérer les cookies HTTP dans les Edge Functions
 * Inspiré de std/http/cookie.ts mais adapté pour notre usage
 */

export class CookieJar {
  private cookies = new Map<string, CookieData>()

  interface CookieData {
    value: string
    domain?: string
    path?: string
    expires?: Date
    secure?: boolean
    httpOnly?: boolean
  }

  /**
   * Ajoute des cookies depuis la réponse HTTP
   */
  addFromResponse(response: Response): void {
    const setCookieHeader = response.headers.get('set-cookie')
    if (!setCookieHeader) return

    // Parser multiple cookies séparés par des virgules
    const cookieStrings = this.splitCookies(setCookieHeader)
    
    for (const cookieString of cookieStrings) {
      this.parseCookie(cookieString)
    }
  }

  /**
   * Split des cookies multiples en gérant les cas complexes
   */
  private splitCookies(cookieHeader: string): string[] {
    const cookies: string[] = []
    let current = ''
    let inQuotes = false
    let i = 0

    while (i < cookieHeader.length) {
      const char = cookieHeader[i]
      
      if (char === '"') {
        inQuotes = !inQuotes
      }
      
      if (char === ',' && !inQuotes) {
        // Vérifier si c'est un délimiteur de cookie ou une date
        const remaining = cookieHeader.substring(i + 1)
        if (this.looksLikeCookieStart(remaining)) {
          cookies.push(current.trim())
          current = ''
          i++
          continue
        }
      }
      
      current += char
      i++
    }
    
    if (current.trim()) {
      cookies.push(current.trim())
    }
    
    return cookies
  }

  /**
   * Vérifie si une chaîne ressemble au début d'un nouveau cookie
   */
  private looksLikeCookieStart(str: string): boolean {
    const trimmed = str.trim()
    return /^[a-zA-Z0-9_-]+=/.test(trimmed)
  }

  /**
   * Parse un cookie individuel
   */
  private parseCookie(cookieString: string): void {
    const parts = cookieString.split(';')
    const [nameValue] = parts
    const [name, value] = nameValue.split('=', 2)
    
    if (!name || !value) return
    
    const cookieData: CookieData = {
      value: value.trim()
    }
    
    // Parser les attributs
    for (let i = 1; i < parts.length; i++) {
      const part = parts[i].trim()
      const [attrName, attrValue] = part.split('=', 2)
      
      switch (attrName.toLowerCase()) {
        case 'domain':
          cookieData.domain = attrValue
          break
        case 'path':
          cookieData.path = attrValue
          break
        case 'expires':
          cookieData.expires = new Date(attrValue)
          break
        case 'secure':
          cookieData.secure = true
          break
        case 'httponly':
          cookieData.httpOnly = true
          break
      }
    }
    
    this.cookies.set(name.trim(), cookieData)
  }

  /**
   * Convertit les cookies en chaîne pour les headers
   */
  toString(): string {
    const validCookies = Array.from(this.cookies.entries()).filter(([name, data]) => {
      // Filtrer les cookies expirés
      if (data.expires && data.expires < new Date()) {
        return false
      }
      return true
    })

    return validCookies
      .map(([name, data]) => `${name}=${data.value}`)
      .join('; ')
  }

  /**
   * Vide tous les cookies
   */
  clear(): void {
    this.cookies.clear()
  }

  /**
   * Vérifie si un cookie existe
   */
  has(name: string): boolean {
    return this.cookies.has(name)
  }

  /**
   * Récupère la valeur d'un cookie
   */
  get(name: string): string | undefined {
    return this.cookies.get(name)?.value
  }

  /**
   * Définit manuellement un cookie
   */
  set(name: string, value: string, options?: Partial<CookieData>): void {
    this.cookies.set(name, {
      value,
      ...options
    })
  }

  /**
   * Supprime un cookie
   */
  delete(name: string): void {
    this.cookies.delete(name)
  }

  /**
   * Retourne tous les cookies comme objet
   */
  toObject(): Record<string, string> {
    const result: Record<string, string> = {}
    for (const [name, data] of this.cookies.entries()) {
      result[name] = data.value
    }
    return result
  }

  /**
   * Charge des cookies depuis un objet
   */
  fromObject(cookies: Record<string, string>): void {
    for (const [name, value] of Object.entries(cookies)) {
      this.set(name, value)
    }
  }

  /**
   * Debug: affiche tous les cookies
   */
  debug(): void {
    console.log('🍪 Cookies actuels:')
    for (const [name, data] of this.cookies.entries()) {
      console.log(`  ${name}=${data.value.substring(0, 20)}${data.value.length > 20 ? '...' : ''}`)
    }
  }
}