'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Search } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import ComposeBar from '@/components/feed/ComposeBar'
import ReviewCard from '@/components/feed/ReviewCard'
import { useAuthStore } from '@/store/auth.store'
import api from '@/lib/api'
import { Review } from '@/types'

export default function FeedPage() {
  const { isAuthenticated, user } = useAuthStore()
  const router = useRouter()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login')
      return
    }
    loadFeed()
  }, [])

  const loadFeed = async () => {
    try {
      if (!user) return
      const res = await api.get(`/reviews/user/${user.id}`)
      setReviews(res.data)
    } catch {
      console.error('Erro ao carregar feed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a' }}>
      <Navbar />

      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ padding: '10px 20px', borderBottom: '0.5px solid #161616' }}>
          <div style={{
            background: '#141414', border: '0.5px solid #222',
            borderRadius: '20px', padding: '8px 14px', fontSize: '12px',
            color: '#555', display: 'flex', alignItems: 'center', gap: '8px',
            cursor: 'pointer',
          }}
            onClick={() => router.push('/search')}
          >
            <Search size={13} color="#444" />
            Pesquise um artista ou álbum
          </div>
        </div>

        <ComposeBar />

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <motion.div
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{ fontSize: '14px', color: '#444' }}
            >
              Carregando...
            </motion.div>
          </div>
        ) : reviews.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <p style={{ fontSize: '16px', color: '#333', marginBottom: '8px', fontFamily: 'Playfair Display, serif' }}>
              Seu feed está vazio
            </p>
            <p style={{ fontSize: '13px', color: '#444' }}>
              Comece buscando artistas e fazendo suas primeiras avaliações
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}