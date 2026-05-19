'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import api from '@/lib/api'
import { useAuthStore } from '@/store/auth.store'

export default function RegisterPage() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { setAuth } = useAuthStore()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/auth/register', { username, email, password })
      setAuth(res.data.user, res.data.token)
      router.push('/feed')
    } catch {
      setError('Erro ao criar conta. Tente outro email ou username.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ width: '100%', maxWidth: '380px' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontFamily: 'Playfair Display, serif', color: '#fff', marginBottom: '8px' }}>
            <span style={{ color: '#1d4ed8' }}>A</span>udimark
          </h1>
          <p style={{ fontSize: '14px', color: '#555' }}>Crie sua conta</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            style={{ background: '#202020', border: '0.5px solid #222', borderRadius: '8px', padding: '12px 14px', fontSize: '14px', color: '#fff', outline: 'none', width: '100%' }}
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{ background: '#202020', border: '0.5px solid #222', borderRadius: '8px', padding: '12px 14px', fontSize: '14px', color: '#fff', outline: 'none', width: '100%' }}
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{ background: '#202020', border: '0.5px solid #222', borderRadius: '8px', padding: '12px 14px', fontSize: '14px', color: '#fff', outline: 'none', width: '100%' }}
          />

          {error && <p style={{ fontSize: '13px', color: '#f43f5e', textAlign: 'center' }}>{error}</p>}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            style={{ background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px', fontSize: '14px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, marginTop: '4px' }}
          >
            {loading ? 'Criando...' : 'Criar conta'}
          </motion.button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '13px', color: '#555', marginTop: '20px' }}>
          Já tem conta?{' '}
          <Link href="/login" style={{ color: '#60a5fa', textDecoration: 'none' }}>Entrar</Link>
        </p>
      </motion.div>
    </div>
  )
}