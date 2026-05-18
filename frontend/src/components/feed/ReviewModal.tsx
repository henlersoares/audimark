'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Star } from 'lucide-react'
import AlbumCover from '@/components/ui/AlbumCover'
import api from '@/lib/api'

interface ReviewModalProps {
  album: {
    spotifyId: string
    title: string
    coverUrl: string
    artist: { name: string }
  }
  onClose: () => void
  onSuccess: () => void
}

export default function ReviewModal({ album, onClose, onSuccess }: ReviewModalProps) {
  const [score, setScore] = useState<number | null>(null)
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const scores = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10]

  const scoreColors: Record<number, string> = {
    0.5: '#dc2626', 1: '#dc2626',
    1.5: '#ea580c', 2: '#ea580c',
    2.5: '#d97706', 3: '#d97706',
    3.5: '#ca8a04', 4: '#ca8a04',
    4.5: '#a3a300', 5: '#a3a300',
    5.5: '#65a30d', 6: '#65a30d',
    6.5: '#16a34a', 7: '#16a34a',
    7.5: '#0891b2', 8: '#0891b2',
    8.5: '#2563eb', 9: '#2563eb',
    9.5: '#1e3a8a', 10: '#1e3a8a',
  }

  function formatScore(score: number): string {
    if (score === 10) return '10'
    return score.toFixed(1).replace('.', ',')
  }

  const handleSubmit = async () => {
    if (!score) {
      setError('Selecione uma nota')
      return
    }
    setLoading(true)
    setError('')
    try {
      await api.post('/reviews', {
        albumId: album.spotifyId,
        score,
        content: content.trim() || undefined,
      })
      onSuccess()
      onClose()
    } catch {
      setError('Erro ao salvar avaliação. Você já avaliou este álbum?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '20px',
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={e => e.stopPropagation()}
          style={{
            background: '#111', border: '0.5px solid #222',
            borderRadius: '12px', padding: '24px',
            width: '100%', maxWidth: '420px',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '16px', fontFamily: 'Playfair Display, serif', color: '#fff' }}>
              Avaliar álbum
            </h2>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555' }}
            >
              <X size={18} />
            </motion.button>
          </div>

          {/* Álbum info */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '20px', background: '#0a0a0a', borderRadius: '8px', padding: '12px' }}>
            <AlbumCover coverUrl={album.coverUrl} title={album.title} size={48} borderRadius={4} />
            <div>
              <div style={{ fontSize: '14px', color: '#fff', fontWeight: 500 }}>{album.title}</div>
              <div style={{ fontSize: '12px', color: '#555' }}>{album.artist.name}</div>
            </div>
          </div>

          {/* Seleção de nota */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '11px', color: '#555', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
              Nota
            </div>
            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
              {scores.map(n => (
                <motion.button
                  key={n}
                  whileHover={{ scale: 1.12, opacity: 1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setScore(n)}
                  style={{
                    width: '38px', height: '34px',
                    borderRadius: '6px',
                    border: 'none',
                    background: scoreColors[n],
                    color: '#fff',
                    fontSize: '11px', fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    opacity: score === null ? 0.5 : score === n ? 1 : 0.4,
                    outline: score === n ? '2px solid #fff' : 'none',
                    outlineOffset: '2px',
                  }}
                >
                  {formatScore(n)}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Review */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '11px', color: '#555', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
              Review (opcional)
            </div>
            <textarea
              placeholder="Escreva sua opinião sobre o álbum..."
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={4}
              style={{
                width: '100%', background: '#0a0a0a',
                border: '0.5px solid #222', borderRadius: '8px',
                padding: '10px 12px', fontSize: '13px',
                color: '#e8e8e8', resize: 'vertical',
                outline: 'none', fontFamily: 'Inter, sans-serif',
                lineHeight: 1.6,
              }}
            />
          </div>

          {error && (
            <p style={{ fontSize: '12px', color: '#f43f5e', marginBottom: '12px' }}>{error}</p>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={loading || !score}
            style={{
              width: '100%', background: score ? '#1d4ed8' : '#1a1a1a',
              color: score ? '#fff' : '#444',
              border: 'none', borderRadius: '8px',
              padding: '11px', fontSize: '13px',
              fontWeight: 600, cursor: score ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s',
            }}
          >
            {loading ? 'Salvando...' : 'Salvar avaliação'}
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}