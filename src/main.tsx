import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './utils/runBulkLyricsOnce.ts'; // déclencheur unique bulk lyrics
import './utils/runOicFixOnce.ts'; // déclencheur unique OIC fix

createRoot(document.getElementById("root")!).render(<App />);
