import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import FormBuilderPage from './pages/FormBuilderPage'
import FormRendererPage from './pages/FormRendererPage'
import MainLayout from './components/layouts/MainLayout'

export default function App(){
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* All admin routes nested under MainLayout */}
      <Route element={<MainLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/builder/:id?" element={<FormBuilderPage />} />
        <Route path="/responses" element={<div>Responses page (todo)</div>} />
        <Route path="/settings" element={<div>Settings page (todo)</div>} />
      </Route>

      {/* Public form renderer (doesn't need admin sidebar) */}
      <Route path="/forms/:slug" element={<FormRendererPage />} />
    </Routes>
  )
}
