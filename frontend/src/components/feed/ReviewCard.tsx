'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Heart, MessageCircle, Share2, ChevronDown, ChevronUp, Send, CornerDownRight, Trash2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Review } from '@/types'
import ScoreBadge from '@/components/ui/ScoreBadge'
import AlbumCover from '@/components/ui/AlbumCover'
import Avatar from '@/components/ui/Avatar'
import TimeAgo from '@/components/ui/TimeAgo'
import api from '@/lib/api'
import { useAuthStore } from '@/store/auth.store'
import { useRouter } from 'next/navigation'

interface Comment {
  id: string
  content: string
  createdAt: string
  user: { id: string; username: string; avatarUrl?: string }
  likes: any[]
  replies: Comment[]
}

interface ReviewCardProps {
  review: Review
}

function parseContent(text: string, router: any) {
  const parts = text.split(/(@\w+)/g)
  return parts.map((part, i) => {
    if (part.startsWith('@')) {
      const username = part.slice(1)
      return (
        <span
          key={i}
          onClick={(e) => { e.stopPropagation(); router.push(`/profile/${username}`) }}
          style={{ color: '#60a5fa', cursor: 'pointer' }}
        >
          {part}
        </span>
      )
    }
    return part
  })
}

export default function ReviewCard({ review }: ReviewCardProps) {
  const { user } = useAuthStore()
  const router = useRouter()
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [expanded, setExpanded] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [replyTo, setReplyTo] = useState<{ id: string; username: string } | null>(null)
  const [loadingComments, setLoadingComments] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [commentCount, setCommentCount] = useState(0)

  const isLong = (review.content?.length ?? 0) > 150

  useEffect(() => {
    loadLikeStatus()
    loadCommentCount()
  }, [])

  const loadCommentCount = async () => {
    try {
      const res = await api.get(`/comments/reviews/${review.id}`)
      setCommentCount(res.data.length)
    } catch { }
  }

  const loadLikeStatus = async () => {
    try {
      const res = await api.get(`/likes/reviews/${review.id}`)
      setLiked(res.data.liked)
      setLikeCount(res.data.count)
    } catch { }
  }

  const loadComments = async () => {
    setLoadingComments(true)
    try {
      const res = await api.get(`/comments/reviews/${review.id}`)
      setComments(res.data)
    } catch { }
    setLoadingComments(false)
  }

  const handleLike = async () => {
    try {
      const res = await api.post(`/likes/reviews/${review.id}`)
      setLiked(res.data.liked)
      setLikeCount(prev => res.data.liked ? prev + 1 : prev - 1)
    } catch { }
  }

  const handleToggleComments = () => {
    if (!showComments) loadComments()
    setShowComments(!showComments)
    setReplyTo(null)
  }

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return
    setSubmitting(true)
    try {
      await api.post(`/comments/reviews/${review.id}`, {
        content: newComment.trim(),
        parentId: replyTo?.id,
      })
      setNewComment('')
      setReplyTo(null)
      setCommentCount(prev => prev + 1)
      loadComments()
    } catch { }
    setSubmitting(false)
  }

  const handleLikeComment = async (commentId: string) => {
    try {
      await api.post(`/likes/comments/${commentId}`)
      setComments(prev => prev.map(comment => {
        if (comment.id === commentId) {
          const alreadyLiked = comment.likes.some((l: any) => l.userId === user?.id)
          return {
            ...comment,
            likes: alreadyLiked
              ? comment.likes.filter((l: any) => l.userId !== user?.id)
              : [...comment.likes, { userId: user?.id }]
          }
        }
        if (comment.replies) {
          return {
            ...comment,
            replies: comment.replies.map(reply => {
              if (reply.id === commentId) {
                const alreadyLiked = reply.likes.some((l: any) => l.userId === user?.id)
                return {
                  ...reply,
                  likes: alreadyLiked
                    ? reply.likes.filter((l: any) => l.userId !== user?.id)
                    : [...reply.likes, { userId: user?.id }]
                }
              }
              return reply
            })
          }
        }
        return comment
      }))
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
        {review.user && (
          <div onClick={() => router.push(`/profile/${review.user!.username}`)} style={{ cursor: 'pointer' }}>
            <Avatar username={review.user.username} avatarUrl={review.user.avatarUrl} />
          </div>
        )}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '13px', color: '#ccc' }}>
            <strong
              style={{ color: '#fff', cursor: 'pointer' }}
              onClick={() => router.push(`/profile/${review.user?.username}`)}
            >
              {review.user?.username}
            </strong>
            <span style={{ color: '#555' }}> avaliou um álbum</span>
          </div>
          <TimeAgo date={review.createdAt} />
        </div>
        <span style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '10px', background: '#1d4ed822', color: '#60a5fa', fontWeight: 600 }}>
          avaliação
        </span>
      </div>

      {/* Album card */}
      <motion.div
        whileHover={{ scale: 1.005 }}
        onClick={() => router.push(`/album/${review.albumId}`)}
        style={{ display: 'flex', gap: '12px', background: '#202020', border: '0.5px solid #2a2a2a', borderRadius: '8px', padding: '12px', marginBottom: '12px', cursor: 'pointer' }}
      >
        <AlbumCover coverUrl={review.album?.coverUrl} title={review.album?.title ?? ''} size={56} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {review.album?.title}
          </div>
          <div style={{ fontSize: '11px', color: '#555', marginBottom: '6px' }}>
            {review.album?.artist?.name} · {new Date(review.album?.releaseDate ?? '').getFullYear()}
          </div>
          <ScoreBadge score={review.score} />
          {review.content && (
            <>
              <div style={{ fontSize: '12px', color: '#777', lineHeight: 1.5, fontStyle: 'italic', marginTop: '6px' }}>
                "{expanded ? review.content : review.content.slice(0, 150)}{!expanded && isLong ? '...' : ''}"
              </div>
              {isLong && (
                <button
                  onClick={(e) => { e.stopPropagation(); setExpanded(!expanded) }}
                  style={{ fontSize: '11px', color: '#60a5fa', background: 'none', border: 'none', cursor: 'pointer', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '3px', padding: 0 }}
                >
                  {expanded ? <><ChevronUp size={12} /> ver menos</> : <><ChevronDown size={12} /> ver mais</>}
                </button>
              )}
            </>
          )}
        </div>
      </motion.div>

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

        <button
          onClick={handleToggleComments}
          style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: showComments ? '#60a5fa' : '#555', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          <MessageCircle size={16} /> {showComments ? comments.length : commentCount}
        </button>

        <button style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#555', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <Share2 size={16} />
        </button>
      </div>

      {/* Comments */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ marginTop: '12px', paddingTop: '12px', borderTop: '0.5px solid #1f1f1f' }}
          >
            {loadingComments ? (
              <div style={{ fontSize: '12px', color: '#444', padding: '8px 0' }}>Carregando...</div>
            ) : comments.length === 0 ? (
              <div style={{ fontSize: '12px', color: '#444', padding: '4px 0' }}>Nenhum comentário ainda.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '12px' }}>
                {comments.map(comment => (
                  <div key={comment.id}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                      <Avatar username={comment.user.username} avatarUrl={comment.user.avatarUrl} size={24} />
                      <div style={{ flex: 1, background: '#1e1e1e', borderRadius: '8px', padding: '8px 10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                          <span
                            style={{ fontSize: '12px', fontWeight: 600, color: '#ccc', cursor: 'pointer' }}
                            onClick={() => router.push(`/profile/${comment.user.username}`)}
                          >
                            {comment.user.username}
                          </span>
                          <TimeAgo date={comment.createdAt} />
                        </div>
                        <div style={{ fontSize: '12px', color: '#888', lineHeight: 1.5 }}>
                          {parseContent(comment.content, router)}
                        </div>
                        <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
                          <button
                            onClick={() => handleLikeComment(comment.id)}
                            style={{
                              fontSize: '11px',
                              color: comment.likes.some((l: any) => l.userId === user?.id) ? '#f43f5e' : '#555',
                              background: 'none', border: 'none', cursor: 'pointer',
                              display: 'flex', alignItems: 'center', gap: '3px', padding: 0
                            }}
                          >
                            <Heart size={12} fill={comment.likes.some((l: any) => l.userId === user?.id) ? '#f43f5e' : 'none'} />
                            {comment.likes.length}
                          </button>
                          <button
                            onClick={() => setReplyTo(replyTo?.id === comment.id ? null : { id: comment.id, username: comment.user.username })}
                            style={{ fontSize: '11px', color: '#555', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px', padding: 0 }}
                          >
                            <CornerDownRight size={12} /> responder
                          </button>

                          {comment.user.id === user?.id && (
                            <button
                              onClick={async () => {
                                await api.delete(`/comments/${comment.id}`)
                                setCommentCount(prev => prev - 1)
                                loadComments()
                              }}
                              style={{ fontSize: '11px', color: '#444', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px', padding: 0, marginLeft: 'auto' }}
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Replies */}
                    {comment.replies?.length > 0 && (
                      <div style={{ marginLeft: '32px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {comment.replies.map(reply => (
                          <div key={reply.id} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                            <Avatar username={reply.user.username} avatarUrl={reply.user.avatarUrl} size={20} />
                            <div style={{ flex: 1, background: '#1e1e1e', borderRadius: '8px', padding: '7px 10px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                                <span style={{ fontSize: '11px', fontWeight: 600, color: '#ccc', cursor: 'pointer' }} onClick={() => router.push(`/profile/${reply.user.username}`)}>
                                  {reply.user.username}
                                </span>
                                <TimeAgo date={reply.createdAt} />
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', fontSize: '12px', color: '#888', lineHeight: 1.5 }}>
                                {parseContent(reply.content, router)}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                                <button
                                  onClick={() => handleLikeComment(reply.id)}
                                  style={{
                                    fontSize: '11px',
                                    color: reply.likes.some((l: any) => l.userId === user?.id) ? '#f43f5e' : '#555',
                                    background: 'none', border: 'none', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', gap: '3px', padding: 0
                                  }}
                                >
                                  <Heart size={11} fill={reply.likes.some((l: any) => l.userId === user?.id) ? '#f43f5e' : 'none'} />
                                  {reply.likes.length}
                                </button>

                                {reply.user.id === user?.id && (
                                  <button
                                    onClick={async () => {
                                      await api.delete(`/comments/${reply.id}`)
                                      setCommentCount(prev => prev - 1)
                                      loadComments()
                                    }}
                                    style={{ fontSize: '11px', color: '#444', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Input comentário */}
            {replyTo && (
              <div style={{ fontSize: '11px', color: '#60a5fa', marginBottom: '6px' }}>
                Respondendo @{replyTo.username} ·{' '}
                <span style={{ cursor: 'pointer', color: '#555' }} onClick={() => setReplyTo(null)}>cancelar</span>
              </div>
            )}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {user && <Avatar username={user.username} avatarUrl={user.avatarUrl} size={24} />}
              <input
                placeholder={replyTo ? `Responder @${replyTo.username}...` : 'Adicionar comentário... use @username para mencionar'}
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmitComment()}
                style={{ flex: 1, background: '#1e1e1e', border: '0.5px solid #2a2a2a', borderRadius: '16px', padding: '7px 12px', fontSize: '12px', color: '#e8e8e8', outline: 'none' }}
              />
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleSubmitComment}
                disabled={submitting || !newComment.trim()}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: newComment.trim() ? '#60a5fa' : '#333', padding: 0 }}
              >
                <Send size={16} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
