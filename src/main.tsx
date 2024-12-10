import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './main.sass'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
