'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Users, Music } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import AlbumCover from '@/components/ui/AlbumCover'
import api from '@/lib/api'
import { Artist, Album } from '@/types'

export default function ArtistPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [artist, setArtist] = useState<Artist & { albums: Album[] } | null>(null)
  const [loading, setLoading] = useState(true)
  const [following, setFollowing] = useState(false)

  useEffect(() => {
    loadArtist()
    checkFollowing()
  }, [id])

  const loadArtist = async () => {
    try {
      const res = await api.get(`/artists/${id}`)
      setArtist(res.data)
    } catch {
      console.error('Erro ao carregar artista')
    } finally {
      setLoading(false)
    }
  }

  const checkFollowing = async () => {
    try {
      const res = await api.get(`/follows/artists/${id}/status`)
      setFollowing(res.data.following)
    } catch {}
  }

  const handleFollow = async () => {
    try {
      if (following) {
        await api.delete(`/follows/artists/${id}`)
      } else {
        await api.post(`/follows/artists/${id}`)
      }
      setFollowing(!following)
    } catch {}
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#1a1a1a' }}>
        <Navbar />
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{ textAlign: 'center', padding: '80px', fontSize: '13px', color: '#444' }}
        >
          Carregando...
        </motion.div>
      </div>
    )
  }

  if (!artist) return null

  return (
    <div style={{ minHeight: '100vh', background: '#1a1a1a' }}>
      <Navbar />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 80px' }}>

        {/* Header do artista */}
        <div style={{ padding: '20px', borderBottom: '0.5px solid #161616' }}>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => router.back()}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555', display: 'flex', marginBottom: '16px' }}
          >
            <ArrowLeft size={20} />
          </motion.button>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <AlbumCover
              coverUrl={artist.imageUrl}
              title={artist.name}
              size={80}
              borderRadius={40}
            />
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: '22px', fontFamily: 'Playfair Display, serif', color: '#fff', marginBottom: '4px' }}>
                {artist.name}
              </h1>
              {artist.genres?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                  {artist.genres.slice(0, 3).map(genre => (
                    <span key={genre} style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '10px', background: '#1d4ed822', color: '#60a5fa', border: '0.5px solid #1d4ed833' }}>
                      {genre}
                    </span>
                  ))}
                </div>
              )}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleFollow}
                style={{
                  background: following ? 'transparent' : '#1d4ed8',
                  color: following ? '#60a5fa' : '#fff',
                  border: following ? '0.5px solid #1d4ed844' : 'none',
                  borderRadius: '6px',
                  padding: '6px 16px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Users size={13} />
                {following ? 'Seguindo' : 'Seguir'}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Álbuns */}
        <div style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Music size={14} color="#555" />
            <span style={{ fontSize: '11px', color: '#555', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Álbuns
            </span>
          </div>

          {artist.albums?.length === 0 ? (
            <p style={{ fontSize: '13px', color: '#444', textAlign: 'center', padding: '20px' }}>
              Nenhum álbum encontrado
            </p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              {artist.albums?.map((album, i) => (
                <motion.div
                  key={album.spotifyId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => router.push(`/album/${album.spotifyId}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <AlbumCover
                    coverUrl={album.coverUrl}
                    title={album.title}
                    size="100%"
                    borderRadius={6}
                  />
                  <div style={{ marginTop: '8px' }}>
                    <div style={{ fontSize: '13px', color: '#fff', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {album.title}
                    </div>
                    <div style={{ fontSize: '11px', color: '#555', marginTop: '2px' }}>
                      {new Date(album.releaseDate).getFullYear()}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}