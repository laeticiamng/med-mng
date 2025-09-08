/**
 * 🔧 NATIVE CONSOLE - MED-MNG v3.0
 * Préservation des méthodes console natives
 */

// Sauvegarder les méthodes console natives avant leur modification
export const nativeConsole = {
  log: console.log.bind(console),
  debug: console.debug.bind(console),
  info: console.info.bind(console),
  warn: console.warn.bind(console),
  error: console.error.bind(console),
  trace: console.trace.bind(console),
  time: console.time.bind(console),
  timeEnd: console.timeEnd.bind(console),
  group: console.group.bind(console),
  groupEnd: console.groupEnd.bind(console),
  clear: console.clear.bind(console),
  table: console.table.bind(console),
  count: console.count.bind(console),
  countReset: console.countReset.bind(console),
  assert: console.assert.bind(console),
  dir: console.dir.bind(console),
  dirxml: console.dirxml.bind(console)
};

export default nativeConsole;