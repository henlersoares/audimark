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
  const [newUsername, setNewUsername] = useState('')
  const [editingUsername, setEditingUsername] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingUsername, setLoadingUsername] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [success, setSuccess] = useState(false)
  const [usernameSuccess, setUsernameSuccess] = useState(false)
  const [error, setError] = useState('')
  const [usernameError, setUsernameError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await api.get('/users/me')
        setAuth(res.data, localStorage.getItem('audimark_token') ?? '')
        setName(res.data.name ?? '')
        setBio(res.data.bio ?? '')
      } catch { }
    }
    loadUser()
  }, [])

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

  const handleChangeUsername = async () => {
    if (!newUsername.trim()) return
    setLoadingUsername(true)
    setUsernameError('')
    setUsernameSuccess(false)
    setEditingUsername(false)
    try {
      const res = await api.patch('/users/me/username', { username: newUsername.trim() })
      setAuth(res.data, localStorage.getItem('audimark_token') ?? '')
      setNewUsername('')
      setUsernameSuccess(true)
      setTimeout(() => setUsernameSuccess(false), 3000)
    } catch (err: any) {
      setUsernameError(err.response?.data?.message ?? 'Erro ao alterar username')
    } finally {
      setLoadingUsername(false)
    }
  }

  if (!user) return null

  const changesLeft = 3 - (user.usernameChangeCount ?? 0)

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

          {/* Username */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontSize: '11px', color: '#555', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Username
              </label>
              <span style={{ fontSize: '11px', color: changesLeft > 0 ? '#555' : '#f43f5e' }}>
                {changesLeft} alteração{changesLeft !== 1 ? 'ões' : ''} restante{changesLeft !== 1 ? 's' : ''}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={editingUsername ? newUsername : user.username}
                onChange={e => setNewUsername(e.target.value)}
                disabled={!editingUsername || changesLeft <= 0}
                onKeyDown={e => e.key === 'Enter' && editingUsername && handleChangeUsername()}
                style={{
                  flex: 1, background: '#141414', border: '0.5px solid #222',
                  borderRadius: '8px', padding: '10px 12px', fontSize: '14px',
                  color: !editingUsername || changesLeft <= 0 ? '#444' : '#fff', outline: 'none',
                  cursor: !editingUsername || changesLeft <= 0 ? 'not-allowed' : 'text',
                }}
              />
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  if (editingUsername) {
                    handleChangeUsername()
                  } else {
                    setEditingUsername(true)
                    setNewUsername(user.username)
                  }
                }}
                disabled={changesLeft <= 0 || (editingUsername && (!newUsername.trim() || loadingUsername))}
                style={{
                  background: editingUsername ? '#1d4ed8' : '#222',
                  color: editingUsername ? '#fff' : '#888',
                  border: 'none', borderRadius: '8px', padding: '10px 16px',
                  fontSize: '13px', fontWeight: 600,
                  cursor: changesLeft <= 0 ? 'not-allowed' : 'pointer',
                  opacity: changesLeft <= 0 ? 0.5 : 1,
                  whiteSpace: 'nowrap',
                }}
              >
                {loadingUsername ? '...' : editingUsername ? 'Confirmar' : 'Alterar'}
              </motion.button>
              {editingUsername && (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { setEditingUsername(false); setNewUsername('') }}
                  style={{
                    background: 'transparent', color: '#555', border: '0.5px solid #333',
                    borderRadius: '8px', padding: '10px 12px',
                    fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap',
                  }}
                >
                  Cancelar
                </motion.button>
              )}
            </div>
            {usernameError && <p style={{ fontSize: '11px', color: '#f43f5e', marginTop: '4px' }}>{usernameError}</p>}
            {usernameSuccess && <p style={{ fontSize: '11px', color: '#22c55e', marginTop: '4px' }}>Username alterado com sucesso!</p>}
            {changesLeft <= 0
              ? <p style={{ fontSize: '11px', color: '#f43f5e', marginTop: '4px' }}>Limite de alterações atingido.</p>
              : <p style={{ fontSize: '11px', color: '#444', marginTop: '4px' }}>Intervalo mínimo de 30 dias entre alterações.</p>
            }
          </div>

          {/* Nome */}
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

          {/* Bio */}
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