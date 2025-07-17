import { Workbox } from 'workbox-window'

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const wb = new Workbox('/sw.js')
    wb.register()
  })
}
