import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'  // Make sure the extension is included
import './index.css'
import { ThemeProvider } from './contexts/ThemeContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
)
