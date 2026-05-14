import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.scss'
import './styles/freehand-card.scss'
import './styles/card.scss'
import './styles/navigation.scss'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
