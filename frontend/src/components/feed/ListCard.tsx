'use client'

import { motion } from 'framer-motion'
import { Heart, Trash2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import Avatar from '@/components/ui/Avatar'
import AlbumCover from '@/components/ui/AlbumCover'
import TimeAgo from '@/components/ui/TimeAgo'
import api from '@/lib/api'
import { useAuthStore } from '@/store/auth.store'
import { useRouter } from 'next/navigation'

interface ListCardProps {
  list: any
  onDelete?: () => void
}

export default function ListCard({ list, onDelete }: ListCardProps) {
  const { user } = useAuthStore()
  const router = useRouter()
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)

  useEffect(() => {
    api.get(`/lists/${list.id}/like`)
      .then(res => { setLiked(res.data.liked); setLikeCount(res.data.count) })
      .catch(() => {})
  }, [list.id])

  const handleLike = async () => {
    try {
      const res = await api.post(`/lists/${list.id}/like`)
      setLiked(res.data.liked)
      setLikeCount(prev => res.data.liked ? prev + 1 : prev - 1)
    } catch {}
  }

  const handleDelete = async () => {
    try {
      await api.delete(`/lists/${list.id}`)
      onDelete?.()
    } catch {}
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ borderBottom: '0.5px solid #141414', padding: '16px 20px' }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
        <div onClick={() => router.push(`/profile/${list.user.username}`)} style={{ cursor: 'pointer' }}>
          <Avatar username={list.user.username} avatarUrl={list.user.avatarUrl} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '13px', color: '#ccc' }}>
            <strong
              style={{ color: '#fff', cursor: 'pointer' }}
              onClick={() => router.push(`/profile/${list.user.username}`)}
            >
              {list.user.username}
            </strong>
            <span style={{ color: '#555' }}> criou uma lista</span>
          </div>
          <TimeAgo date={list.createdAt} />
        </div>
        <span style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '10px', background: '#a78bfa22', color: '#a78bfa', fontWeight: 600 }}>
          lista
        </span>
        {user?.id === list.user.id && (
          <button
            onClick={handleDelete}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#444', display: 'flex' }}
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {/* List title e description */}
      <div style={{ marginBottom: '12px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#fff', marginBottom: '4px', fontFamily: 'Playfair Display, serif' }}>
          {list.title}
        </h3>
        {list.description && (
          <p style={{ fontSize: '12px', color: '#666', lineHeight: 1.5 }}>{list.description}</p>
        )}
      </div>

      {/* Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
        {list.items.map((item: any, index: number) => (
          <motion.div
            key={item.id}
            whileHover={{ x: 4 }}
            onClick={() => router.push(`/album/${item.albumId}`)}
            style={{ display: 'flex', gap: '12px', alignItems: 'center', cursor: 'pointer', padding: '8px', borderRadius: '8px', background: '#202020' }}
          >
            <span style={{ fontSize: '13px', color: '#444', fontWeight: 700, width: '20px', textAlign: 'center', flexShrink: 0 }}>
              {index + 1}
            </span>
            <AlbumCover coverUrl={item.album?.coverUrl} title={item.album?.title ?? ''} size={44} borderRadius={4} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '13px', color: '#fff', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {item.album?.title}
              </div>
              <div style={{ fontSize: '11px', color: '#555' }}>{item.album?.artist?.name}</div>
              {item.note && (
                <div style={{ fontSize: '11px', color: '#888', fontStyle: 'italic', marginTop: '2px' }}>
                  "{item.note}"
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={handleLike}
          style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: liked ? '#f43f5e' : '#555', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          <motion.div animate={{ scale: liked ? [1, 1.3, 1] : 1 }} transition={{ duration: 0.2 }}>
            <Heart size={16} fill={liked ? '#f43f5e' : 'none'} />
          </motion.div>
          {likeCount}
        </motion.button>
      </div>
    </motion.div>
  )
}