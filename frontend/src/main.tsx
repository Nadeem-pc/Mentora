import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Toaster } from './components/ui/sonner.tsx'
import { AuthProvider } from './contexts/auth.context.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <Toaster/>
      <App />
    </AuthProvider>
  </StrictMode>
)