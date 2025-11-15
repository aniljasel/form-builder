import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../ui/Sidebar'

export default function MainLayout() {
  return (
    <div className="app-root">
      <div style={{ display: 'flex', gap: 16 }}>
        <Sidebar />
        <main style={{ flex: 1, minHeight: 'calc(100vh - 84px)' }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
