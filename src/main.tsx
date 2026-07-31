import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { BetaGate } from './components/BetaGate'
import './styles.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BetaGate>
      <App />
    </BetaGate>
  </StrictMode>,
)
