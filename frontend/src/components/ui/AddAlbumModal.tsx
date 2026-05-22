'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Search } from 'lucide-react'
import AlbumCover from '@/components/ui/AlbumCover'
import api from '@/lib/api'

interface Props {
  onClose: () => void
  onSelect: (album: any) => void
  title: string
}

export default function AddAlbumModal({ onClose, onSelect, title }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)

  const handleSearch = async (value: string) => {
    setQuery(value)
    if (value.length < 2) { setResults([]); return }
    setSearching(true)
    try {
      const res = await api.get(`/albums/search?q=${encodeURIComponent(value)}`)
      setResults(res.data)
    } catch {}
    setSearching(false)
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={e => e.stopPropagation()}
          style={{ background: '#111', border: '0.5px solid #222', borderRadius: '12px', padding: '24px', width: '100%', maxWidth: '440px', maxHeight: '80vh', overflowY: 'auto' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '16px', fontFamily: 'Playfair Display, serif', color: '#fff' }}>{title}</h2>
            <motion.button whileTap={{ scale: 0.95 }} onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555' }}>
              <X size={18} />
            </motion.button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#0a0a0a', border: '0.5px solid #222', borderRadius: '8px', padding: '8px 12px', marginBottom: '12px' }}>
            <Search size={14} color="#444" />
            <input
              autoFocus
              placeholder="Buscar álbum..."
              value={query}
              onChange={e => handleSearch(e.target.value)}
              style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: '13px', color: '#e8e8e8' }}
            />
          </div>

          {searching && (
            <p style={{ fontSize: '12px', color: '#444', textAlign: 'center', padding: '12px' }}>Buscando...</p>
          )}

          {results.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {results.map((album: any) => (
                <motion.div
                  key={album.spotifyId}
                  whileHover={{ background: '#1a1a1a' }}
                  onClick={() => { onSelect(album); onClose() }}
                  style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '8px', borderRadius: '6px', cursor: 'pointer' }}
                >
                  <AlbumCover coverUrl={album.coverUrl} title={album.title} size={40} borderRadius={4} />
                  <div>
                    <div style={{ fontSize: '13px', color: '#fff', fontWeight: 500 }}>{album.title}</div>
                    <div style={{ fontSize: '11px', color: '#555' }}>{album.artist?.name}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}