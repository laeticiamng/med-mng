import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './utils/runBulkLyricsOnce.ts'; // déclencheur unique bulk lyrics
import './utils/runOicFixOnce.ts'; // déclencheur unique complétion OIC

createRoot(document.getElementById("root")!).render(<App />);
