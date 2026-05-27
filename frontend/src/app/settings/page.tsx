'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Camera } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Avatar from '@/components/ui/Avatar'
import api from '@/lib/api'
import { useAuthStore } from '@/store/auth.store'

export default function SettingsPage() {
  const router = useRouter()
  const { user, setAuth } = useAuthStore()
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (user) {
      setName(user.name ?? '')
      setBio(user.bio ?? '')
    }
  }, [user])

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    setSuccess(false)
    try {
      const res = await api.patch('/users/me', { name, bio })
      setAuth(res.data, localStorage.getItem('audimark_token') ?? '')
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch {
      setError('Erro ao salvar alterações')
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingAvatar(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await api.post('/users/me/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setAuth(res.data, localStorage.getItem('audimark_token') ?? '')
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch {
      setError('Erro ao fazer upload da foto')
    } finally {
      setUploadingAvatar(false)
    }
  }

  if (!user) return null

  return (
    <div style={{ minHeight: '100vh', background: '#1a1a1a' }}>
      <Navbar />

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '32px 20px' }}>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => router.back()}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', marginBottom: '24px' }}
        >
          <ArrowLeft size={16} /> Voltar
        </motion.button>

        <h1 style={{ fontSize: '22px', fontFamily: 'Playfair Display, serif', color: '#fff', marginBottom: '24px' }}>
          Editar perfil
        </h1>

        {/* Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px' }}>
          <div style={{ position: 'relative' }}>
            <Avatar username={user.username} avatarUrl={user.avatarUrl} size={72} />
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => fileInputRef.current?.click()}
              style={{
                position: 'absolute', bottom: 0, right: 0,
                width: '24px', height: '24px', borderRadius: '50%',
                background: uploadingAvatar ? '#333' : '#1d4ed8',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', cursor: 'pointer',
              }}
            >
              {uploadingAvatar
                ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} style={{ width: '10px', height: '10px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%' }} />
                : <Camera size={12} color="#fff" />
              }
            </motion.div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              style={{ display: 'none' }}
            />
          </div>
          <div>
            <div style={{ fontSize: '14px', color: '#fff', fontWeight: 500 }}>{user.username}</div>
            <div
              style={{ fontSize: '12px', color: '#60a5fa', marginTop: '2px', cursor: 'pointer' }}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploadingAvatar ? 'Enviando...' : 'Alterar foto de perfil'}
            </div>
          </div>
        </div>

        {/* Campos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          <div>
            <label style={{ fontSize: '11px', color: '#555', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
              Username
            </label>
            <input
              value={user.username}
              disabled
              style={{ width: '100%', background: '#141414', border: '0.5px solid #222', borderRadius: '8px', padding: '10px 12px', fontSize: '14px', color: '#444', outline: 'none', cursor: 'not-allowed' }}
            />
            <p style={{ fontSize: '11px', color: '#444', marginTop: '4px' }}>O username não pode ser alterado</p>
          </div>

          <div>
            <label style={{ fontSize: '11px', color: '#555', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
              Nome
            </label>
            <input
              type="text"
              placeholder="Seu nome completo"
              value={name}
              onChange={e => setName(e.target.value)}
              style={{ width: '100%', background: '#141414', border: '0.5px solid #222', borderRadius: '8px', padding: '10px 12px', fontSize: '14px', color: '#fff', outline: 'none' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '11px', color: '#555', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
              Bio
            </label>
            <textarea
              placeholder="Fale um pouco sobre você..."
              value={bio}
              onChange={e => setBio(e.target.value)}
              rows={3}
              maxLength={200}
              style={{ width: '100%', background: '#141414', border: '0.5px solid #222', borderRadius: '8px', padding: '10px 12px', fontSize: '14px', color: '#fff', outline: 'none', resize: 'vertical', fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }}
            />
            <p style={{ fontSize: '11px', color: '#444', marginTop: '4px', textAlign: 'right' }}>{bio.length}/200</p>
          </div>

        </div>

        {error && <p style={{ fontSize: '13px', color: '#f43f5e', marginTop: '12px' }}>{error}</p>}
        {success && <p style={{ fontSize: '13px', color: '#22c55e', marginTop: '12px' }}>Perfil atualizado com sucesso!</p>}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: '100%', marginTop: '24px',
            background: '#1d4ed8', color: '#fff',
            border: 'none', borderRadius: '8px',
            padding: '12px', fontSize: '14px',
            fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? 'Salvando...' : 'Salvar alterações'}
        </motion.button>
      </div>
    </div>
  )
}