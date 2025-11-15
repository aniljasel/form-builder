import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState('admin@you.com')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      const res = await fetch('https://form-builder-vb1y.onrender.com/api/auth/login', {
        method: 'POST',
        credentials: 'include', // important to receive httpOnly cookie
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Login failed')
      // login successful — backend set cookie automatically
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Login error')
    }
  }

  return (
    <div className="container" style={{ maxWidth: 560, marginTop: 40 }}>
      <div className="glass p-6">
        <h2>Admin login</h2>
        <form onSubmit={handleSubmit}>
          <div><label>Email</label><input value={email} onChange={e=>setEmail(e.target.value)} /></div>
          <div><label>Password</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} /></div>
          {error && <div style={{color:'red'}}>{error}</div>}
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  )
}
