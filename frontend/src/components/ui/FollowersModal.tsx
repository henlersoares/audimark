'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Avatar from '@/components/ui/Avatar'
import api from '@/lib/api'
import { useAuthStore } from '@/store/auth.store'

interface UserItem {
  id: string
  username: string
  avatarUrl?: string
}

interface Props {
  userId: string
  tab: 'followers' | 'following'
  onClose: () => void
}

export default function FollowersModal({ userId, tab, onClose }: Props) {
  const router = useRouter()
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState<'followers' | 'following'>(tab)
  const [followers, setFollowers] = useState<UserItem[]>([])
  const [following, setFollowing] = useState<UserItem[]>([])
  const [followingMe, setFollowingMe] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [userId])

  const loadData = async () => {
    setLoading(true)
    try {
      const [followersRes, followingRes] = await Promise.all([
        api.get(`/follows/users/${userId}/followers`),
        api.get(`/follows/users/${userId}/following`),
      ])

      setFollowers(followersRes.data.map((f: any) => f.follower))
      setFollowing(followingRes.data.map((f: any) => f.followingUser))

      // quem o usuário logado já segue
      const myFollowingRes = await api.get('/follows/users')
      const ids = new Set<string>(myFollowingRes.data.map((f: any) => f.followingUser?.id))
      setFollowingMe(ids)
    } catch {
      console.error('Erro ao carregar seguidores')
    } finally {
      setLoading(false)
    }
  }

  const handleFollow = async (targetId: string) => {
    try {
      if (followingMe.has(targetId)) {
        await api.delete(`/follows/users/${targetId}`)
        setFollowingMe(prev => { const s = new Set(prev); s.delete(targetId); return s })
      } else {
        await api.post(`/follows/users/${targetId}`)
        setFollowingMe(prev => new Set(prev).add(targetId))
      }
    } catch { }
  }

  const list = activeTab === 'followers' ? followers : following

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={e => e.stopPropagation()}
          style={{
            background: '#1a1a1a', border: '0.5px solid #2a2a2a',
            borderRadius: '12px', width: '400px', maxHeight: '560px',
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div style={{ padding: '16px 20px', borderBottom: '0.5px solid #222', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '4px', background: '#111', borderRadius: '8px', padding: '3px' }}>
              {(['followers', 'following'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  style={{
                    background: activeTab === t ? '#2a2a2a' : 'transparent',
                    border: 'none', borderRadius: '6px',
                    padding: '5px 14px', fontSize: '12px', cursor: 'pointer',
                    color: activeTab === t ? '#fff' : '#555', fontWeight: activeTab === t ? 600 : 400,
                    transition: 'all 0.15s',
                  }}
                >
                  {t === 'followers' ? `Seguidores · ${followers.length}` : `Seguindo · ${following.length}`}
                </button>
              ))}
            </div>
            <button
              onClick={onClose}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#555', display: 'flex' }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Lista */}
          <div style={{ overflowY: 'auto', flex: 1, padding: '8px 0' }}>
            {loading ? (
              <motion.div
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                style={{ textAlign: 'center', padding: '40px', fontSize: '13px', color: '#444' }}
              >
                Carregando...
              </motion.div>
            ) : list.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', fontSize: '13px', color: '#444' }}>
                <Users size={28} color="#333" style={{ marginBottom: '10px' }} />
                <div>Nenhum usuário ainda.</div>
              </div>
            ) : (
              list.map((u, i) => (
                <motion.div
                  key={u.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 20px', cursor: 'pointer',
                  }}
                  whileHover={{ background: '#202020' }}
                >
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}
                    onClick={() => { router.push(`/profile/${u.username}`); onClose() }}
                  >
                    <Avatar username={u.username} avatarUrl={u.avatarUrl} size={38} />
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>{u.username}</div>
                      <div style={{ fontSize: '11px', color: '#555' }}>@{u.username}</div>
                    </div>
                  </div>

                  {user?.id !== u.id && (
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleFollow(u.id)}
                      style={{
                        background: followingMe.has(u.id) ? 'transparent' : '#1d4ed8',
                        color: followingMe.has(u.id) ? '#60a5fa' : '#fff',
                        border: followingMe.has(u.id) ? '0.5px solid #1d4ed844' : 'none',
                        borderRadius: '6px', padding: '5px 14px',
                        fontSize: '11px', fontWeight: 600, cursor: 'pointer',
                      }}
                    >
                      {followingMe.has(u.id) ? 'Seguindo' : 'Seguir'}
                    </motion.button>
                  )}
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}