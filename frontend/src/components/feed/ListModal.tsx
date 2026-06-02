'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Search, GripVertical, Plus } from 'lucide-react'
import Avatar from '@/components/ui/Avatar'
import AlbumCover from '@/components/ui/AlbumCover'
import api from '@/lib/api'
import { useAuthStore } from '@/store/auth.store'

interface Album {
  spotifyId: string
  title: string
  coverUrl: string
  artistName: string
}

interface ListItemDraft {
  album: Album
  note: string
}

interface Props {
  onClose: () => void
  onSuccess: () => void
}

export default function ListModal({ onClose, onSuccess }: Props) {
  const { user } = useAuthStore()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [items, setItems] = useState<ListItemDraft[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Album[]>([])
  const [searching, setSearching] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    if (query.length < 2) { setSearchResults([]); return }
    setSearching(true)
    try {
      const res = await api.get(`/albums/search?q=${encodeURIComponent(query)}`)
      setSearchResults(res.data.map((a: any) => ({
        spotifyId: a.spotifyId,
        title: a.title,
        coverUrl: a.coverUrl,
        artistName: a.artistName ?? a.artist?.name,
      })))
    } catch { }
    setSearching(false)
  }

  const handleAddAlbum = async (album: Album) => {
    if (items.some(i => i.album.spotifyId === album.spotifyId)) return
    try {
      await api.get(`/albums/${album.spotifyId}`)
    } catch { }
    setItems(prev => [...prev, { album, note: '' }])
    setSearchQuery('')
    setSearchResults([])
  }

  const handleRemoveItem = (spotifyId: string) => {
    setItems(prev => prev.filter(i => i.album.spotifyId !== spotifyId))
  }

  const handleNoteChange = (spotifyId: string, note: string) => {
    setItems(prev => prev.map(i => i.album.spotifyId === spotifyId ? { ...i, note } : i))
  }

  const handleSubmit = async () => {
    if (!title.trim() || items.length === 0) return
    setSubmitting(true)
    setError('')
    try {
      await api.post('/lists', {
        title: title.trim(),
        description: description.trim() || undefined,
        items: items.map(i => ({ albumId: i.album.spotifyId, note: i.note.trim() || undefined })),
      })
      onSuccess()
    } catch {
      setError('Erro ao criar lista')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={e => e.stopPropagation()}
          style={{ background: '#1a1a1a', border: '0.5px solid #2a2a2a', borderRadius: '12px', width: '560px', maxHeight: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
        >
          {/* Header */}
          <div style={{ padding: '16px 20px', borderBottom: '0.5px solid #222', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>Nova lista</span>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555' }}>
              <X size={16} />
            </button>
          </div>

          <div style={{ padding: '20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* User */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              {user && <Avatar username={user.username} avatarUrl={user.avatarUrl} size={36} />}
              <span style={{ fontSize: '13px', color: '#ccc', fontWeight: 500 }}>{user?.username}</span>
            </div>

            {/* Título */}
            <input
              placeholder="Título da lista (ex: Top 5 álbuns de 2024)"
              value={title}
              onChange={e => setTitle(e.target.value)}
              maxLength={100}
              style={{ background: '#141414', border: '0.5px solid #2a2a2a', borderRadius: '8px', padding: '10px 12px', fontSize: '13px', color: '#fff', outline: 'none' }}
            />

            {/* Descrição */}
            <textarea
              placeholder="Descrição opcional..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
              maxLength={300}
              style={{ background: '#141414', border: '0.5px solid #2a2a2a', borderRadius: '8px', padding: '10px 12px', fontSize: '13px', color: '#fff', outline: 'none', resize: 'none', fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }}
            />

            {/* Álbuns da lista */}
            {items.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {items.map((item, index) => (
                  <div key={item.album.spotifyId} style={{ background: '#202020', borderRadius: '8px', padding: '10px 12px' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '12px', color: '#444', fontWeight: 600, width: '20px', textAlign: 'center' }}>{index + 1}</span>
                      <AlbumCover coverUrl={item.album.coverUrl} title={item.album.title} size={40} borderRadius={4} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '13px', color: '#fff', fontWeight: 500 }}>{item.album.title}</div>
                        <div style={{ fontSize: '11px', color: '#555' }}>{item.album.artistName}</div>
                      </div>
                      <button onClick={() => handleRemoveItem(item.album.spotifyId)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555' }}>
                        <X size={14} />
                      </button>
                    </div>
                    <input
                      placeholder="Adicione uma nota sobre este álbum (opcional)..."
                      value={item.note}
                      onChange={e => handleNoteChange(item.album.spotifyId, e.target.value)}
                      maxLength={200}
                      style={{ width: '100%', background: '#141414', border: '0.5px solid #2a2a2a', borderRadius: '6px', padding: '7px 10px', fontSize: '12px', color: '#ccc', outline: 'none' }}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Busca de álbum */}
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#141414', border: '0.5px solid #2a2a2a', borderRadius: '8px', padding: '10px 12px' }}>
                <Plus size={13} color="#444" />
                <input
                  placeholder="Adicionar álbum à lista..."
                  value={searchQuery}
                  onChange={e => handleSearch(e.target.value)}
                  style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: '13px', color: '#fff' }}
                />
                {searching && <span style={{ fontSize: '11px', color: '#444' }}>Buscando...</span>}
              </div>
              {searchResults.length > 0 && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#1a1a1a', border: '0.5px solid #2a2a2a', borderRadius: '8px', zIndex: 10, maxHeight: '200px', overflowY: 'auto', marginTop: '4px' }}>
                  {searchResults.map(album => (
                    <div
                      key={album.spotifyId}
                      onClick={() => handleAddAlbum(album)}
                      style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '10px 12px', cursor: 'pointer' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#222')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <AlbumCover coverUrl={album.coverUrl} title={album.title} size={36} borderRadius={4} />
                      <div>
                        <div style={{ fontSize: '13px', color: '#fff' }}>{album.title}</div>
                        <div style={{ fontSize: '11px', color: '#555' }}>{album.artistName}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div style={{ padding: '12px 20px', borderTop: '0.5px solid #222', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {error && <p style={{ fontSize: '12px', color: '#f43f5e' }}>{error}</p>}
            <span style={{ fontSize: '11px', color: '#444' }}>{items.length} álbum{items.length !== 1 ? 'ns' : ''}</span>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleSubmit}
              disabled={!title.trim() || items.length === 0 || submitting}
              style={{
                background: !title.trim() || items.length === 0 ? '#1a1a1a' : '#1d4ed8',
                color: !title.trim() || items.length === 0 ? '#444' : '#fff',
                border: 'none', borderRadius: '8px', padding: '10px 20px',
                fontSize: '13px', fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer',
              }}
            >
              {submitting ? 'Criando...' : 'Criar lista'}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}