import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthContextProvider } from './contexts/auth/index.tsx'
import { Toaster } from './components/ui/sonner.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthContextProvider>
      <Toaster />
      <App />
    </AuthContextProvider>
  </StrictMode>,
)