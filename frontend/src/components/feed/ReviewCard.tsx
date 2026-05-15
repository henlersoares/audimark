'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Heart, MessageCircle, Share2, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import { Review } from '@/types'
import ScoreBadge from '@/components/ui/ScoreBadge'
import AlbumCover from '@/components/ui/AlbumCover'
import Avatar from '@/components/ui/Avatar'
import TimeAgo from '@/components/ui/TimeAgo'

interface ReviewCardProps {
  review: Review
}

export default function ReviewCard({ review }: ReviewCardProps) {
  const [liked, setLiked] = useState(false)
  const [likes, setLikes] = useState(0)
  const [expanded, setExpanded] = useState(false)
  const [showComments, setShowComments] = useState(false)

  const isLong = (review.content?.length ?? 0) > 150

  const handleLike = () => {
    setLiked(!liked)
    setLikes(liked ? likes - 1 : likes + 1)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ borderBottom: '0.5px solid #141414', padding: '16px 20px' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
        {review.user && <Avatar username={review.user.username} avatarUrl={review.user.avatarUrl} />}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '13px', color: '#ccc' }}>
            <strong style={{ color: '#fff' }}>{review.user?.username}</strong>
            <span style={{ color: '#555' }}> avaliou um álbum</span>
          </div>
          <TimeAgo date={review.createdAt} />
        </div>
        <span style={{
          fontSize: '10px', padding: '2px 7px', borderRadius: '10px',
          background: '#1d4ed822', color: '#60a5fa', fontWeight: 600,
        }}>avaliação</span>
      </div>

      <motion.div
        whileHover={{ scale: 1.005 }}
        style={{
          display: 'flex', gap: '12px', background: '#111',
          border: '0.5px solid #1a1a1a', borderRadius: '8px',
          padding: '12px', marginBottom: '12px',
          transition: 'border-color 0.2s',
          cursor: 'pointer',
        }}
      >
        <AlbumCover coverUrl={review.album?.coverUrl} title={review.album?.title ?? ''} size={56} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {review.album?.title}
          </div>
          <div style={{ fontSize: '11px', color: '#555', marginBottom: '6px' }}>
            {review.album?.artist?.name} · {new Date(review.album?.releaseDate ?? '').getFullYear()}
          </div>
          <div style={{ marginBottom: '5px' }}>
            <ScoreBadge score={review.score} />
          </div>
          {review.content && (
            <>
              <div style={{ fontSize: '12px', color: '#777', lineHeight: 1.5, fontStyle: 'italic' }}>
                "{expanded ? review.content : review.content.slice(0, 150)}{!expanded && isLong ? '...' : ''}"
              </div>
              {isLong && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  style={{ fontSize: '11px', color: '#60a5fa', background: 'none', border: 'none', cursor: 'pointer', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '3px', padding: 0 }}
                >
                  {expanded ? <><ChevronUp size={12} /> ver menos</> : <><ChevronDown size={12} /> ver mais</>}
                </button>
              )}
            </>
          )}
        </div>
      </motion.div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={handleLike}
          style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: liked ? '#f43f5e' : '#555', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          <motion.div animate={{ scale: liked ? [1, 1.3, 1] : 1 }} transition={{ duration: 0.2 }}>
            <Heart size={16} fill={liked ? '#f43f5e' : 'none'} />
          </motion.div>
          {likes}
        </motion.button>

        <button
          onClick={() => setShowComments(!showComments)}
          style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#555', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          <MessageCircle size={16} /> 0
        </button>

        <button style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#555', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <Share2 size={16} />
        </button>
      </div>

      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ marginTop: '12px', paddingTop: '10px', borderTop: '0.5px solid #161616' }}
          >
            <div style={{ fontSize: '12px', color: '#444', textAlign: 'center', padding: '8px 0' }}>
              Nenhum comentário ainda. Seja o primeiro!
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '8px' }}>
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#1d4ed822', border: '1px solid #1d4ed844', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', color: '#60a5fa', flexShrink: 0 }}>HS</div>
              <input
                placeholder="Adicionar comentário..."
                style={{ flex: 1, background: '#141414', border: '0.5px solid #1f1f1f', borderRadius: '16px', padding: '6px 12px', fontSize: '12px', color: '#888', outline: 'none' }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}