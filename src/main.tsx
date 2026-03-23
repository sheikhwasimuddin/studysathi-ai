import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initializeRunAnywhere } from './services/ai/providers/runAnywhereSdk'

initializeRunAnywhere().catch((error) => {
  console.warn('RunAnywhere SDK initialization failed. Falling back to local generator.', error);
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
