/**
 * Module CAS Login - Gère l'authentification CAS UNESS complète
 * Implémente le flux CAS en 2 étapes selon les spécifications du ticket
 */

import { CookieJar } from './cookieJar.ts'
import * as cheerio from 'https://esm.sh/cheerio@1.0.0-rc.12'

interface CASResult {
  success: boolean
  cookieJar?: CookieJar
  error?: string
  debug?: any
}

interface CASConfig {
  email: string
  password: string
  userAgent?: string
  debug?: boolean
}

/**
 * Authentification CAS complète pour UNESS
 */
export async function loginWithCAS(config: CASConfig): Promise<CASResult> {
  const {
    email,
    password,
    userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    debug = false
  } = config

  const cookieJar = new CookieJar()
  
  try {
    if (debug) console.log('[CAS] Début authentification UNESS')
    
    // Étape 1: Initialisation session Cockpit
    const initResult = await initializeCockpitSession(cookieJar, userAgent, debug)
    if (!initResult.success) {
      return { success: false, error: `Init failed: ${initResult.error}` }
    }
    
    // Étape 2: Soumission email
    const emailResult = await submitEmail(cookieJar, userAgent, email, initResult.formData, debug)
    if (!emailResult.success) {
      return { success: false, error: `Email failed: ${emailResult.error}` }
    }
    
    // Étape 3: Soumission mot de passe
    const passwordResult = await submitPassword(cookieJar, userAgent, email, password, emailResult.formData, debug)
    if (!passwordResult.success) {
      return { success: false, error: `Password failed: ${passwordResult.error}` }
    }
    
    // Étape 4: Redirection vers LiSA et validation
    const lisaResult = await validateLisaAccess(cookieJar, userAgent, debug)
    if (!lisaResult.success) {
      return { success: false, error: `LiSA access failed: ${lisaResult.error}` }
    }
    
    if (debug) console.log('[CAS] ✅ Authentification complète réussie')
    
    return {
      success: true,
      cookieJar
    }
    
  } catch (error) {
    console.error('[CAS] Erreur critique:', error)
    return {
      success: false,
      error: error.message,
      debug: error.stack
    }
  }
}

/**
 * Étape 1: Initialisation de la session Cockpit
 */
async function initializeCockpitSession(cookieJar: CookieJar, userAgent: string, debug: boolean) {
  try {
    if (debug) console.log('[CAS] Étape 1: Initialisation Cockpit')
    
    const response = await fetch('https://cockpit.uness.fr/', {
      headers: {
        'User-Agent': userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.8,en-US;q=0.5,en;q=0.3',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      }
    })
    
    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}` }
    }
    
    cookieJar.addFromResponse(response)
    const html = await response.text()
    
    // Parser le formulaire initial
    const $ = cheerio.load(html)
    const form = $('form').first()
    const formData = extractFormData($, form)
    
    if (debug) {
      console.log('[CAS] Session initialisée')
      cookieJar.debug()
    }
    
    return {
      success: true,
      formData,
      html
    }
    
  } catch (error) {
    return { success: false, error: error.message }
  }
}

/**
 * Étape 2: Soumission de l'email
 */
async function submitEmail(
  cookieJar: CookieJar, 
  userAgent: string, 
  email: string, 
  initialFormData: Record<string, string>,
  debug: boolean
) {
  try {
    if (debug) console.log('[CAS] Étape 2: Soumission email')
    
    const formData = new URLSearchParams()
    formData.append('username', email)
    
    // Ajouter tous les champs cachés
    for (const [key, value] of Object.entries(initialFormData)) {
      if (key !== 'username') {
        formData.append(key, value)
      }
    }
    
    const response = await fetch('https://cockpit.uness.fr/cas/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': userAgent,
        'Cookie': cookieJar.toString(),
        'Origin': 'https://cockpit.uness.fr',
        'Referer': 'https://cockpit.uness.fr/',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      body: formData.toString(),
      redirect: 'manual'
    })
    
    cookieJar.addFromResponse(response)
    
    // Suivre les redirections
    const finalResponse = await followRedirections(response, cookieJar, userAgent, 5)
    const html = await finalResponse.text()
    
    // Vérifier qu'on est sur la page mot de passe
    if (!html.includes('password') && !html.includes('mot de passe')) {
      return { success: false, error: 'Page mot de passe non atteinte' }
    }
    
    // Parser le nouveau formulaire
    const $ = cheerio.load(html)
    const form = $('form').first()
    const formData2 = extractFormData($, form)
    
    if (debug) console.log('[CAS] Email soumis, page mot de passe atteinte')
    
    return {
      success: true,
      formData: formData2,
      html,
      finalUrl: finalResponse.url
    }
    
  } catch (error) {
    return { success: false, error: error.message }
  }
}

/**
 * Étape 3: Soumission du mot de passe
 */
async function submitPassword(
  cookieJar: CookieJar,
  userAgent: string,
  email: string,
  password: string,
  formData: Record<string, string>,
  debug: boolean
) {
  try {
    if (debug) console.log('[CAS] Étape 3: Soumission mot de passe')
    
    // Vérifier les champs CAS requis
    const lt = formData.lt
    const execution = formData.execution
    
    if (!lt || !execution) {
      return { 
        success: false, 
        error: `Champs CAS manquants - lt: ${!!lt}, execution: ${!!execution}` 
      }
    }
    
    const passwordFormData = new URLSearchParams()
    passwordFormData.append('username', email)
    passwordFormData.append('password', password)
    passwordFormData.append('lt', lt)
    passwordFormData.append('execution', execution)
    passwordFormData.append('_eventId', 'submit')
    
    // Ajouter autres champs cachés
    for (const [key, value] of Object.entries(formData)) {
      if (!['username', 'password', 'lt', 'execution', '_eventId'].includes(key)) {
        passwordFormData.append(key, value)
      }
    }
    
    const response = await fetch('https://auth.uness.fr/cas/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': userAgent,
        'Cookie': cookieJar.toString(),
        'Origin': 'https://auth.uness.fr',
        'Referer': 'https://auth.uness.fr/cas/login',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      body: passwordFormData.toString(),
      redirect: 'manual'
    })
    
    cookieJar.addFromResponse(response)
    
    if (debug) console.log(`[CAS] Réponse mot de passe: ${response.status}`)
    
    // Suivre toutes les redirections CAS
    const finalResponse = await followRedirections(response, cookieJar, userAgent, 10)
    const html = await finalResponse.text()
    
    // Vérifier qu'il n'y a pas d'erreur d'authentification
    if (html.includes('Identifiants incorrects') || 
        html.includes('Authentication failed') ||
        html.includes('Invalid credentials')) {
      return { success: false, error: 'Identifiants incorrects' }
    }
    
    if (debug) console.log('[CAS] Mot de passe accepté')
    
    return {
      success: true,
      html,
      finalUrl: finalResponse.url
    }
    
  } catch (error) {
    return { success: false, error: error.message }
  }
}

/**
 * Étape 4: Validation de l'accès LiSA
 */
async function validateLisaAccess(cookieJar: CookieJar, userAgent: string, debug: boolean) {
  try {
    if (debug) console.log('[CAS] Étape 4: Validation accès LiSA')
    
    const response = await fetch('https://livret.uness.fr/lisa/2025/Accueil', {
      headers: {
        'User-Agent': userAgent,
        'Cookie': cookieJar.toString(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      }
    })
    
    cookieJar.addFromResponse(response)
    
    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}` }
    }
    
    const html = await response.text()
    
    // Vérifications multiples pour confirmer l'accès authentifié
    const isLoginPage = html.includes('Veuillez saisir votre adresse e-mail') ||
                       html.includes('authentification') ||
                       html.includes('Se connecter')
    
    const isLisaPage = html.includes('LiSA') ||
                      html.includes('Item de connaissance') ||
                      html.includes('Livret interactif') ||
                      html.includes('2025')
    
    if (isLoginPage) {
      return { success: false, error: 'Toujours sur page de connexion' }
    }
    
    if (!isLisaPage) {
      return { success: false, error: 'Page LiSA non reconnue' }
    }
    
    if (debug) console.log('[CAS] ✅ Accès LiSA validé')
    
    return { success: true }
    
  } catch (error) {
    return { success: false, error: error.message }
  }
}

/**
 * Suit les redirections HTTP
 */
async function followRedirections(
  response: Response, 
  cookieJar: CookieJar, 
  userAgent: string, 
  maxRedirects: number = 5
): Promise<Response> {
  let current = response
  let redirectCount = 0
  
  while (current.status >= 300 && current.status < 400 && redirectCount < maxRedirects) {
    const location = current.headers.get('location')
    if (!location) break
    
    const redirectUrl = new URL(location, current.url).href
    
    current = await fetch(redirectUrl, {
      headers: {
        'User-Agent': userAgent,
        'Cookie': cookieJar.toString(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      redirect: 'manual'
    })
    
    cookieJar.addFromResponse(current)
    redirectCount++
  }
  
  return current
}

/**
 * Extrait les données de formulaire (champs cachés)
 */
function extractFormData($: any, form: any): Record<string, string> {
  const data: Record<string, string> = {}
  
  form.find('input[type="hidden"]').each((_: number, element: any) => {
    const name = $(element).attr('name')
    const value = $(element).attr('value')
    if (name && value) {
      data[name] = value
    }
  })
  
  return data
}

/**
 * Test rapide de connectivité CAS
 */
export async function testCASConnectivity(): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch('https://cockpit.uness.fr/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Test)',
      }
    })
    
    if (response.ok) {
      return { success: true, message: 'Cockpit UNESS accessible' }
    } else {
      return { success: false, message: `HTTP ${response.status}` }
    }
    
  } catch (error) {
    return { success: false, message: error.message }
  }
}