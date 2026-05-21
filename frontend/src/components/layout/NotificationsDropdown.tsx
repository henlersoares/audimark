'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Check } from 'lucide-react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import TimeAgo from '@/components/ui/TimeAgo'

interface Notification {
  id: string
  type: string
  message: string
  read: boolean
  link?: string
  createdAt: string
}

function getNotificationIcon(type: string) {
  const icons: Record<string, string> = {
    like_review: '❤️',
    comment_review: '💬',
    reply_comment: '↩️',
    mention: '@',
    new_follower: '👤',
    new_release: '🎵',
  }
  return icons[type] ?? '🔔'
}

function FollowBackButton({ notification }: { notification: Notification }) {
  const [following, setFollowing] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(false)

  const username = notification.message.match(/@(\w+)/)?.[1]

  useEffect(() => {
    const checkFollowing = async () => {
      if (!username) return
      try {
        const userRes = await api.get(`/users/${username}`)
        const followRes = await api.get('/follows/users')
        const isFollowing = followRes.data.some((f: any) => f.followingUser?.id === userRes.data.id)
        setFollowing(isFollowing)
      } catch {
        setFollowing(false)
      }
    }
    checkFollowing()
  }, [username])

  const handleFollow = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!username) return
    setLoading(true)
    try {
      const userRes = await api.get(`/users/${username}`)
      await api.post(`/follows/users/${userRes.data.id}`)
      setFollowing(true)
    } catch { }
    setLoading(false)
  }

  if (following === null) return null
  if (following) return <span style={{ fontSize: '11px', color: '#555' }}>Seguindo</span>

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleFollow}
      disabled={loading}
      style={{
        background: '#1d4ed8', color: '#fff', border: 'none',
        borderRadius: '5px', padding: '3px 10px',
        fontSize: '11px', fontWeight: 600, cursor: 'pointer',
        opacity: loading ? 0.7 : 1,
      }}
    >
      {loading ? '...' : 'Seguir de volta'}
    </motion.button>
  )
}

export default function NotificationsDropdown() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadUnreadCount()
    const interval = setInterval(loadUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const loadUnreadCount = async () => {
    try {
      const res = await api.get('/notifications/unread')
      setUnreadCount(res.data.count)
    } catch { }
  }

  const loadNotifications = async () => {
    try {
      const res = await api.get('/notifications')
      setNotifications(res.data)
    } catch { }
  }

  const handleOpen = async () => {
    if (!open) {
      await loadNotifications()
    }
    setOpen(!open)
  }

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all')
      setUnreadCount(0)
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    } catch { }
  }

  const handleClick = async (notification: Notification) => {
    try {
      await api.patch(`/notifications/${notification.id}/read`)
      setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, read: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch { }
    if (notification.link) {
      router.push(notification.link)
      setOpen(false)
    }
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleOpen}
        style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center' }}
      >
        <Bell size={18} color={open ? '#60a5fa' : '#555'} />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            style={{
              position: 'absolute', top: '-6px', right: '-6px',
              background: '#f43f5e', color: '#fff',
              fontSize: '10px', fontWeight: 700,
              width: '16px', height: '16px',
              borderRadius: '50%', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            style={{
              position: 'absolute', right: 0, top: '36px',
              width: '320px', background: '#1a1a1a',
              border: '0.5px solid #2a2a2a', borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              zIndex: 200, overflow: 'hidden',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '0.5px solid #2a2a2a' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>Notificações</span>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  style={{ fontSize: '11px', color: '#60a5fa', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Check size={12} /> marcar todas como lidas
                </button>
              )}
            </div>

            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {notifications.length === 0 ? (
                <div style={{ padding: '32px 16px', textAlign: 'center', fontSize: '13px', color: '#444' }}>
                  Nenhuma notificação ainda
                </div>
              ) : (
                notifications.map(notification => (
                  <motion.div
                    key={notification.id}
                    whileHover={{ backgroundColor: '#222' }}
                    style={{
                      display: 'flex', gap: '10px', alignItems: 'flex-start',
                      padding: '12px 16px',
                      borderBottom: '0.5px solid #222',
                      background: notification.read ? 'transparent' : '#1d4ed808',
                    }}
                  >
                    <span
                      onClick={() => handleClick(notification)}
                      style={{ fontSize: '16px', flexShrink: 0, marginTop: '1px', cursor: 'pointer' }}
                    >
                      {getNotificationIcon(notification.type)}
                    </span>
                    <div style={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={() => handleClick(notification)}>
                      <div style={{ fontSize: '12px', color: notification.read ? '#777' : '#ccc', lineHeight: 1.4 }}>
                        {notification.message}
                      </div>
                      <TimeAgo date={notification.createdAt} />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', flexShrink: 0 }}>
                      {!notification.read && (
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#1d4ed8' }} />
                      )}
                      {notification.type === 'new_follower' && (
                        <FollowBackButton notification={notification} />
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}