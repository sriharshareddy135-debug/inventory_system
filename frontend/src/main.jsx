import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#14142c',
            color: '#d8d8e4',
            border: '1px solid rgba(96,96,144,0.4)',
            borderRadius: '12px',
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#34d399', secondary: '#080814' } },
          error: { iconTheme: { primary: '#fb7185', secondary: '#080814' } },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
)
