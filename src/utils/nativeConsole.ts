/**
 * 🔧 NATIVE CONSOLE REFERENCES - MED-MNG v3.0
 * Sauvegarde des références console natives AVANT tout remplacement
 */

// IMPORTANT: Ce module DOIT être importé en premier pour sauvegarder les références natives
export const nativeConsole = {
  log: console.log.bind(console),
  info: console.info.bind(console),
  warn: console.warn.bind(console),
  error: console.error.bind(console),
  debug: console.debug.bind(console),
  time: console.time.bind(console),
  timeEnd: console.timeEnd.bind(console),
  table: console.table.bind(console),
  group: console.group.bind(console),
  groupEnd: console.groupEnd.bind(console),
  clear: console.clear.bind(console),
};