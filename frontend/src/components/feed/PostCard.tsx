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

interface PostCardProps {
  post: any
  onDelete?: () => void
}

export default function PostCard({ post, onDelete }: PostCardProps) {
  const { user } = useAuthStore()
  const router = useRouter()
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)

  useEffect(() => {
    api.get(`/posts/${post.id}/like`)
      .then(res => { setLiked(res.data.liked); setLikeCount(res.data.count) })
      .catch(() => { })
  }, [post.id])

  const handleLike = async () => {
    try {
      const res = await api.post(`/posts/${post.id}/like`)
      setLiked(res.data.liked)
      setLikeCount(prev => res.data.liked ? prev + 1 : prev - 1)
    } catch { }
  }

  const handleDelete = async () => {
    try {
      await api.delete(`/posts/${post.id}`)
      onDelete?.()
    } catch { }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ borderBottom: '0.5px solid #141414', padding: '16px 20px' }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
        <div onClick={() => router.push(`/profile/${post.user.username}`)} style={{ cursor: 'pointer' }}>
          <Avatar username={post.user.username} avatarUrl={post.user.avatarUrl} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '13px', color: '#ccc' }}>
            <strong
              style={{ color: '#fff', cursor: 'pointer' }}
              onClick={() => router.push(`/profile/${post.user.username}`)}
            >
              {post.user.username}
            </strong>
            <span style={{ color: '#555' }}> publicou sobre um álbum</span>
          </div>
          <TimeAgo date={post.createdAt} />
        </div>
        <span style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '10px', background: '#60a5fa22', color: '#60a5fa', fontWeight: 600 }}>
          publicação
        </span>
        {user?.id === post.user.id && (
          <button
            onClick={handleDelete}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#444', display: 'flex' }}
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {/* Album */}
      <motion.div
        whileHover={{ scale: 1.005 }}
        onClick={() => router.push(`/album/${post.albumId}`)}
        style={{ display: 'flex', gap: '12px', background: '#202020', border: '0.5px solid #2a2a2a', borderRadius: '8px', padding: '12px', marginBottom: '12px', cursor: 'pointer' }}
      >
        <AlbumCover coverUrl={post.album?.coverUrl} title={post.album?.title ?? ''} size={52} borderRadius={4} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {post.album?.title}
          </div>
          <div style={{ fontSize: '11px', color: '#555' }}>
            {post.album?.artist?.name} · {new Date(post.album?.releaseDate ?? '').getFullYear()}
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <p style={{ fontSize: '13px', color: '#ccc', lineHeight: 1.6, marginBottom: '12px' }}>
        {post.content}
      </p>

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