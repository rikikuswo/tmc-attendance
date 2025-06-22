import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import FormPage from './pages/FormPage'
import DetailPage from './pages/DetailPage'
import AttendancePage from './pages/AttendancePage'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/form" element={<FormPage />} />
        <Route path="/detail/:id" element={<DetailPage />} />
        <Route path="/attendance" element={<AttendancePage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
