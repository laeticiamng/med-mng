// Pure JS utility functions - pas de TypeScript complexe

// Gestion des dates simple
export function formatDate(date, format = 'dd/mm/yyyy') {
  const d = new Date(date);
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  
  const formats = {
    'dd/mm/yyyy': `${day}/${month}/${year}`,
    'mm/dd/yyyy': `${month}/${day}/${year}`,
    'yyyy-mm-dd': `${year}-${month}-${day}`,
    'dd/mm/yyyy hh:mm': `${day}/${month}/${year} ${hours}:${minutes}`,
    'relative': getRelativeTime(d)
  };
  
  return formats[format] || formats['dd/mm/yyyy'];
}

function getRelativeTime(date) {
  const now = new Date();
  const diff = now - date;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
  if (hours > 0) return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
  if (minutes > 0) return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
  return 'À l\'instant';
}

// Manipulation de chaînes
export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function slugify(str) {
  return str
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

export function truncate(str, length = 100, suffix = '...') {
  if (!str || str.length <= length) return str;
  return str.substring(0, length) + suffix;
}

// Manipulation d'objets et tableaux
export function groupBy(array, key) {
  return array.reduce((result, item) => {
    const group = typeof key === 'function' ? key(item) : item[key];
    (result[group] = result[group] || []).push(item);
    return result;
  }, {});
}

export function sortBy(array, key, direction = 'asc') {
  return [...array].sort((a, b) => {
    const aVal = typeof key === 'function' ? key(a) : a[key];
    const bVal = typeof key === 'function' ? key(b) : b[key];
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
}

export function unique(array, key) {
  if (!key) return [...new Set(array)];
  
  const seen = new Set();
  return array.filter(item => {
    const value = typeof key === 'function' ? key(item) : item[key];
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
}

export function chunk(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

// Validation simple
export function isEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function isUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function isEmpty(value) {
  if (value == null) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

// Formatage des nombres
export function formatNumber(num, options = {}) {
  const {
    decimals = 0,
    separator = ' ',
    decimal = ','
  } = options;
  
  const number = parseFloat(num);
  if (isNaN(number)) return '0';
  
  const fixed = number.toFixed(decimals);
  const parts = fixed.split('.');
  
  // Add thousand separators
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator);
  
  return parts.join(decimal);
}

export function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
}

// Utilitaires de performance
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function throttle(func, limit) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Gestion des erreurs simple
export function safeJsonParse(str, fallback = null) {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

export function safeGet(obj, path, fallback = undefined) {
  const keys = path.split('.');
  let result = obj;
  
  for (const key of keys) {
    if (result == null || typeof result !== 'object') {
      return fallback;
    }
    result = result[key];
  }
  
  return result !== undefined ? result : fallback;
}

// Storage helpers
export function getStorageItem(key, fallback = null, storage = localStorage) {
  try {
    const item = storage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

export function setStorageItem(key, value, storage = localStorage) {
  try {
    storage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function removeStorageItem(key, storage = localStorage) {
  try {
    storage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

// Classe simple pour la gestion d'événements
export class SimpleEventEmitter {
  constructor() {
    this.events = {};
  }
  
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
    
    // Return unsubscribe function
    return () => this.off(event, callback);
  }
  
  off(event, callback) {
    if (!this.events[event]) return;
    
    const index = this.events[event].indexOf(callback);
    if (index > -1) {
      this.events[event].splice(index, 1);
    }
  }
  
  emit(event, ...args) {
    if (!this.events[event]) return;
    
    this.events[event].forEach(callback => {
      try {
        callback(...args);
      } catch (error) {
        console.error(`Error in event handler for "${event}":`, error);
      }
    });
  }
  
  once(event, callback) {
    const onceCallback = (...args) => {
      callback(...args);
      this.off(event, onceCallback);
    };
    
    return this.on(event, onceCallback);
  }
}

// Instance globale pour l'app
export const globalEvents = new SimpleEventEmitter();