import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import ChatProvider from './Context/ChatProvider.tsx'
import { ThemeProvider } from './Context/ThemeContext.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ChatProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </ChatProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
