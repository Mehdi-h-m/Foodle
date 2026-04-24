import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './App.css'
import AuthProvider from './AuthContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider />
  </StrictMode>,
)
