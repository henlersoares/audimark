'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Search } from 'lucide-react'
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

interface Props {
  onClose: () => void
  onSuccess: () => void
}

export default function PostModal({ onClose, onSuccess }: Props) {
  const { user } = useAuthStore()
  const [content, setContent] = useState('')
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null)
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

  const handleSelectAlbum = async (album: Album) => {
    try {
      await api.get(`/albums/${album.spotifyId}`)
    } catch { }
    setSelectedAlbum(album)
    setSearchQuery('')
    setSearchResults([])
  }

  const handleSubmit = async () => {
    if (!selectedAlbum || !content.trim()) return
    setSubmitting(true)
    setError('')
    try {
      await api.post('/posts', { albumId: selectedAlbum.spotifyId, content: content.trim() })
      onSuccess()
    } catch {
      setError('Erro ao publicar')
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
          style={{ background: '#1a1a1a', border: '0.5px solid #2a2a2a', borderRadius: '12px', width: '520px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
        >
          {/* Header */}
          <div style={{ padding: '16px 20px', borderBottom: '0.5px solid #222', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>Nova publicação</span>
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

            {/* Álbum selecionado ou busca */}
            {selectedAlbum ? (
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', background: '#202020', borderRadius: '8px', padding: '10px' }}>
                <AlbumCover coverUrl={selectedAlbum.coverUrl} title={selectedAlbum.title} size={48} borderRadius={4} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', color: '#fff', fontWeight: 500 }}>{selectedAlbum.title}</div>
                  <div style={{ fontSize: '11px', color: '#555' }}>{selectedAlbum.artistName}</div>
                </div>
                <button onClick={() => setSelectedAlbum(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555' }}>
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div style={{ position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#141414', border: '0.5px solid #2a2a2a', borderRadius: '8px', padding: '10px 12px' }}>
                  <Search size={13} color="#444" />
                  <input
                    placeholder="Buscar álbum..."
                    value={searchQuery}
                    onChange={e => handleSearch(e.target.value)}
                    style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: '13px', color: '#fff' }}
                  />
                </div>
                {searchResults.length > 0 && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#1a1a1a', border: '0.5px solid #2a2a2a', borderRadius: '8px', zIndex: 10, maxHeight: '200px', overflowY: 'auto', marginTop: '4px' }}>
                    {searchResults.map(album => (
                      <div
                        key={album.spotifyId}
                        onClick={() => handleSelectAlbum(album)}
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
            )}

            {/* Texto */}
            <textarea
              placeholder="Escreva sobre este álbum..."
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={5}
              maxLength={1000}
              style={{ background: '#141414', border: '0.5px solid #2a2a2a', borderRadius: '8px', padding: '12px', fontSize: '13px', color: '#fff', outline: 'none', resize: 'vertical', fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }}
            />
            <p style={{ fontSize: '11px', color: '#444', textAlign: 'right', marginTop: '-10px' }}>{content.length}/1000</p>
          </div>

          {/* Footer */}
          <div style={{ padding: '12px 20px', borderTop: '0.5px solid #222', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {error && <p style={{ fontSize: '12px', color: '#f43f5e' }}>{error}</p>}
            <div style={{ marginLeft: 'auto' }}>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleSubmit}
                disabled={!selectedAlbum || !content.trim() || submitting}
                style={{
                  background: !selectedAlbum || !content.trim() ? '#1a1a1a' : '#1d4ed8',
                  color: !selectedAlbum || !content.trim() ? '#444' : '#fff',
                  border: 'none', borderRadius: '8px', padding: '10px 20px',
                  fontSize: '13px', fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer',
                }}
              >
                {submitting ? 'Publicando...' : 'Publicar'}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}