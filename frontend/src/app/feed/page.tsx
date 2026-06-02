'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Navbar from '@/components/layout/Navbar'
import ComposeBar from '@/components/feed/ComposeBar'
import ReviewCard from '@/components/feed/ReviewCard'
import PostCard from '@/components/feed/PostCard'
import ListCard from '@/components/feed/ListCard'
import { useAuthStore } from '@/store/auth.store'
import api from '@/lib/api'
import { Review } from '@/types'

interface FeedItem {
  type: 'review' | 'post' | 'list'
  createdAt: string
  data: any
}

export default function FeedPage() {
  const { isAuthenticated } = useAuthStore()
  const router = useRouter()
  const [feedItems, setFeedItems] = useState<FeedItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login')
      return
    }

    const timer = setTimeout(() => {
      loadFeed()
    }, 300)
    return () => clearTimeout(timer)
  }, [])

  const loadFeed = async () => {
    try {
      const [reviewsRes, postsRes, listsRes] = await Promise.all([
        api.get('/reviews/feed').catch(e => { console.error('reviews error', e.response?.data); return { data: [] } }),
        api.get('/posts/feed').catch(e => { console.error('posts error', e.response?.data); return { data: [] } }),
        api.get('/lists/feed').catch(e => { console.error('lists error', e.response?.data); return { data: [] } }),
      ])

      const items: FeedItem[] = [
        ...reviewsRes.data.map((r: Review) => ({ type: 'review' as const, createdAt: r.createdAt, data: r })),
        ...postsRes.data.map((p: any) => ({ type: 'post' as const, createdAt: p.createdAt, data: p })),
        ...listsRes.data.map((l: any) => ({ type: 'list' as const, createdAt: l.createdAt, data: l })),
      ]

      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      setFeedItems(items)
    } catch (e: any) {
      console.error('Erro ao carregar feed', e.response?.data)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#1a1a1a' }}>
      <Navbar />
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 80px' }}>
        <ComposeBar onSuccess={loadFeed} />

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
        ) : feedItems.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <p style={{ fontSize: '16px', color: '#333', marginBottom: '8px', fontFamily: 'Playfair Display, serif' }}>
              Seu feed está vazio
            </p>
            <p style={{ fontSize: '13px', color: '#444' }}>
              Comece buscando artistas e fazendo suas primeiras avaliações
            </p>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {feedItems.map((item) => {
              if (item.type === 'review') {
                return <ReviewCard key={`review-${item.data.id}`} review={item.data} />
              }
              if (item.type === 'post') {
                return <PostCard key={`post-${item.data.id}`} post={item.data} onDelete={loadFeed} />
              }
              if (item.type === 'list') {
                return <ListCard key={`list-${item.data.id}`} list={item.data} onDelete={loadFeed} />
              }
            })}
          </motion.div>
        )}
      </div>
    </div>
  )
}