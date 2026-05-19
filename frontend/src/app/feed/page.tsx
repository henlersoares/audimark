'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
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
      const res = await api.get('/reviews/feed')
      setReviews(res.data)
    } catch {
      console.error('Erro ao carregar feed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#1a1a1a' }}>
      <Navbar />
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 80px' }}>
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