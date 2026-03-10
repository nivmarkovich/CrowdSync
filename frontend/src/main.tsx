import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { MockDataProvider } from './context/MockDataContext'
import { LocalCrateProvider } from './context/LocalCrateContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MockDataProvider>
      <LocalCrateProvider>
        <App />
      </LocalCrateProvider>
    </MockDataProvider>
  </StrictMode>,
)
