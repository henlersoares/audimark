'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ArrowLeft } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import AlbumCover from '@/components/ui/AlbumCover'
import api from '@/lib/api'
import { Artist } from '@/types'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [artists, setArtists] = useState<Artist[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSearch = async (value: string) => {
    setQuery(value)
    if (value.length < 2) {
      setArtists([])
      return
    }
    setLoading(true)
    try {
      const res = await api.get(`/artists/search?q=${encodeURIComponent(value)}`)
      setArtists(res.data)
    } catch {
      console.error('Erro na busca')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a' }}>
      <Navbar />

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => router.back()}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555', display: 'flex' }}
          >
            <ArrowLeft size={20} />
          </motion.button>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px', background: '#141414', border: '0.5px solid #222', borderRadius: '20px', padding: '8px 14px' }}>
            <Search size={14} color="#444" />
            <input
              autoFocus
              placeholder="Pesquise um artista ou álbum"
              value={query}
              onChange={e => handleSearch(e.target.value)}
              style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: '14px', color: '#e8e8e8' }}
            />
          </div>
        </div>

        {loading && (
          <motion.div
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{ textAlign: 'center', padding: '40px', fontSize: '13px', color: '#444' }}
          >
            Buscando...
          </motion.div>
        )}

        <AnimatePresence>
          {artists.length > 0 && !loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <p style={{ fontSize: '11px', color: '#444', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>
                Artistas
              </p>
              {artists.map((artist, i) => (
                <motion.div
                  key={artist.spotifyId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ backgroundColor: '#111' }}
                  onClick={() => router.push(`/artist/${artist.spotifyId}`)}
                  style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '10px', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.15s' }}
                >
                  <AlbumCover
                    coverUrl={artist.imageUrl}
                    title={artist.name}
                    size={48}
                    borderRadius={24}
                  />
                  <div>
                    <div style={{ fontSize: '14px', color: '#fff', fontWeight: 500 }}>{artist.name}</div>
                    {artist.genres?.length > 0 && (
                      <div style={{ fontSize: '11px', color: '#555', marginTop: '2px' }}>
                        {artist.genres.slice(0, 2).join(', ')}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {query.length >= 2 && artists.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '40px', fontSize: '13px', color: '#444' }}>
            Nenhum artista encontrado para "{query}"
          </div>
        )}
      </div>
    </div>
  )
}