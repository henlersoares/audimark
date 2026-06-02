'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Calendar, Music, Users, Edit2, LayoutGrid, List, ChevronDown, X, PenLine } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Avatar from '@/components/ui/Avatar'
import ScoreBadge from '@/components/ui/ScoreBadge'
import AlbumCover from '@/components/ui/AlbumCover'
import TimeAgo from '@/components/ui/TimeAgo'
import AddAlbumModal from '@/components/ui/AddAlbumModal'
import FollowersModal from '@/components/ui/FollowersModal'
import api from '@/lib/api'
import { useAuthStore } from '@/store/auth.store'

interface Profile {
  id: string
  username: string
  name?: string
  bio?: string
  avatarUrl?: string
  createdAt: string
}

type TabType = 'reviews' | 'posts' | 'lists'

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>()
  const router = useRouter()
  const { user } = useAuthStore()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [reviews, setReviews] = useState<any[]>([])
  const [posts, setPosts] = useState<any[]>([])
  const [lists, setLists] = useState<any[]>([])
  const [followingArtists, setFollowingArtists] = useState<any[]>([])
  const [followersModal, setFollowersModal] = useState<'followers' | 'following' | null>(null)
  const [followerCount, setFollowerCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)
  const [isFollowing, setIsFollowing] = useState(false)
  const [favorites, setFavorites] = useState<any[]>([])
  const [wantToListen, setWantToListen] = useState<any[]>([])
  const [showAddFavorite, setShowAddFavorite] = useState(false)
  const [showAddWantToListen, setShowAddWantToListen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('reviews')
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [sortOrder, setSortOrder] = useState<'recent' | 'high' | 'low'>('recent')
  const isOwner = user?.username === username

  useEffect(() => {
    loadProfile()
  }, [username])

  const loadProfile = async () => {
    try {
      const profileRes = await api.get(`/users/${username}`)
      setProfile(profileRes.data)

      const [reviewsRes, artistsRes, favRes, wantRes, postsRes, listsRes] = await Promise.all([
        api.get(`/reviews/user/${profileRes.data.id}`),
        api.get('/follows/artists'),
        api.get('/favorites'),
        api.get('/favorites/want-to-listen'),
        api.get(`/posts/user/${profileRes.data.id}`),
        api.get(`/lists/user/${profileRes.data.id}`),
      ])

      setReviews(reviewsRes.data)
      setFollowingArtists(artistsRes.data)
      setFavorites(favRes.data)
      setWantToListen(wantRes.data)
      setPosts(postsRes.data)
      setLists(listsRes.data)

      const [fCountRes, fingCountRes] = await Promise.all([
        api.get(`/follows/users/${profileRes.data.id}/followers`),
        api.get(`/follows/users/${profileRes.data.id}/following`),
      ])
      setFollowerCount(fCountRes.data.length)
      setFollowingCount(fingCountRes.data.length)

      try {
        const followRes = await api.get('/follows/users')
        setIsFollowing(followRes.data.some((f: any) => f.followingUser?.id === profileRes.data.id))
      } catch { }
    } catch {
      console.error('Erro ao carregar perfil')
    } finally {
      setLoading(false)
    }
  }

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await api.delete(`/follows/users/${profile?.id}`)
      } else {
        await api.post(`/follows/users/${profile?.id}`)
      }
      setIsFollowing(!isFollowing)
    } catch { }
  }

  const handleAddFavorite = async (album: any) => {
    try {
      await api.get(`/albums/${album.spotifyId}`)
      await api.post(`/favorites/${album.spotifyId}`)
      loadProfile()
    } catch {
      console.error('Erro ao adicionar favorito')
    }
  }

  const handleAddWantToListen = async (album: any) => {
    try {
      await api.get(`/albums/${album.spotifyId}`)
      await api.post(`/favorites/want-to-listen/${album.spotifyId}`)
      loadProfile()
    } catch {
      console.error('Erro ao adicionar à lista')
    }
  }

  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortOrder === 'high') return b.score - a.score
    if (sortOrder === 'low') return a.score - b.score
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#1a1a1a' }}>
        <Navbar />
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{ textAlign: 'center', padding: '80px', fontSize: '13px', color: '#444' }}
        >
          Carregando...
        </motion.div>
      </div>
    )
  }

  if (!profile) return null

  const tabs: { key: TabType; label: string; count: number }[] = [
    { key: 'reviews', label: 'Avaliações', count: reviews.length },
    { key: 'posts', label: 'Publicações', count: posts.length },
    { key: 'lists', label: 'Listas', count: lists.length },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#1a1a1a' }}>
      <Navbar />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 80px' }}>

        {/* Header */}
        <div style={{ padding: '32px 0 24px', borderBottom: '0.5px solid #161616', display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
          <Avatar username={profile.username} avatarUrl={profile.avatarUrl} size={80} />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
              <h1 style={{ fontSize: '22px', fontFamily: 'Playfair Display, serif', color: '#fff' }}>
                {profile.name ?? profile.username}
              </h1>
              {isOwner ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push('/settings')}
                  style={{ background: 'transparent', border: '0.5px solid #333', borderRadius: '6px', padding: '4px 10px', fontSize: '11px', color: '#888', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Edit2 size={11} /> Editar perfil
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleFollow}
                  style={{
                    background: isFollowing ? 'transparent' : '#1d4ed8',
                    color: isFollowing ? '#60a5fa' : '#fff',
                    border: isFollowing ? '0.5px solid #1d4ed844' : 'none',
                    borderRadius: '6px', padding: '6px 16px',
                    fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '6px',
                  }}
                >
                  <Users size={13} />
                  {isFollowing ? 'Seguindo' : 'Seguir'}
                </motion.button>
              )}
            </div>
            <div style={{ fontSize: '13px', color: '#555', marginBottom: '10px' }}>@{profile.username}</div>
            {profile.bio && (
              <p style={{ fontSize: '13px', color: '#888', lineHeight: 1.6, marginBottom: '12px', maxWidth: '500px' }}>
                {profile.bio}
              </p>
            )}
            <div style={{ display: 'flex', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#555' }}>
                <Music size={12} />
                <strong style={{ color: '#ccc' }}>{reviews.length}</strong> avaliações
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#555' }}>
                <Users size={12} />
                <strong style={{ color: '#ccc' }}>{followingArtists.length}</strong> artistas seguidos
              </div>
              <div
                onClick={() => setFollowersModal('following')}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#555', cursor: 'pointer' }}
              >
                <Users size={12} />
                <strong style={{ color: '#ccc' }}>{followingCount}</strong> seguindo
              </div>
              <div
                onClick={() => setFollowersModal('followers')}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#555', cursor: 'pointer' }}
              >
                <Users size={12} />
                <strong style={{ color: '#ccc' }}>{followerCount}</strong> seguidores
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#555' }}>
                <Calendar size={12} />
                membro desde {new Date(profile.createdAt).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
              </div>
            </div>
          </div>
        </div>

        {/* Álbuns favoritos */}
        <div style={{ padding: '24px 0', borderBottom: '0.5px solid #161616' }}>
          <div style={{ fontSize: '11px', color: '#555', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '16px' }}>
            Álbuns favoritos
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {favorites.map((fav) => (
              <div
                key={fav.id}
                style={{ cursor: 'pointer', width: '120px', position: 'relative' }}
                onMouseEnter={e => { const btn = e.currentTarget.querySelector('.delete-btn') as HTMLElement; if (btn) btn.style.opacity = '1' }}
                onMouseLeave={e => { const btn = e.currentTarget.querySelector('.delete-btn') as HTMLElement; if (btn) btn.style.opacity = '0' }}
              >
                <div onClick={() => router.push(`/album/${fav.albumId}`)}>
                  <AlbumCover coverUrl={fav.album?.coverUrl} title={fav.album?.title ?? ''} size="100%" borderRadius={6} />
                </div>
                {isOwner && (
                  <button
                    className="delete-btn"
                    onClick={async (e) => {
                      e.stopPropagation()
                      await api.delete(`/favorites/${fav.albumId}`)
                      loadProfile()
                    }}
                    style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.7)', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', opacity: 0, transition: 'opacity 0.15s' }}
                  >
                    <X size={11} />
                  </button>
                )}
                <div style={{ marginTop: '6px' }}>
                  <div style={{ fontSize: '12px', color: '#ccc', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {fav.album?.title}
                  </div>
                  <div style={{ fontSize: '11px', color: '#555' }}>{fav.album?.artist?.name}</div>
                </div>
              </div>
            ))}
            {isOwner && favorites.length < 5 && (
              <motion.div
                whileHover={{ scale: 1.04 }}
                onClick={() => setShowAddFavorite(true)}
                style={{ width: '120px', aspectRatio: '1/1', border: '0.5px dashed #333', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#444', fontSize: '24px' }}
              >
                +
              </motion.div>
            )}
            {!isOwner && favorites.length === 0 && (
              <p style={{ fontSize: '13px', color: '#333' }}>Nenhum álbum favorito ainda.</p>
            )}
          </div>
        </div>

        {/* Quero ouvir */}
        <div style={{ padding: '24px 0', borderBottom: '0.5px solid #161616' }}>
          <div style={{ fontSize: '11px', color: '#555', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '16px' }}>
            Quero ouvir
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {wantToListen.map((item) => (
              <div
                key={item.id}
                style={{ cursor: 'pointer', width: '100px', position: 'relative' }}
                onMouseEnter={e => { const btn = e.currentTarget.querySelector('.delete-btn') as HTMLElement; if (btn) btn.style.opacity = '1' }}
                onMouseLeave={e => { const btn = e.currentTarget.querySelector('.delete-btn') as HTMLElement; if (btn) btn.style.opacity = '0' }}
              >
                <div onClick={() => router.push(`/album/${item.albumId}`)}>
                  <AlbumCover coverUrl={item.album?.coverUrl} title={item.album?.title ?? ''} size="100%" borderRadius={6} />
                </div>
                {isOwner && (
                  <button
                    className="delete-btn"
                    onClick={async (e) => {
                      e.stopPropagation()
                      await api.delete(`/favorites/want-to-listen/${item.albumId}`)
                      loadProfile()
                    }}
                    style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.7)', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', opacity: 0, transition: 'opacity 0.15s' }}
                  >
                    <X size={11} />
                  </button>
                )}
                <div style={{ marginTop: '6px' }}>
                  <div style={{ fontSize: '11px', color: '#ccc', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.album?.title}
                  </div>
                  <div style={{ fontSize: '10px', color: '#555' }}>{item.album?.artist?.name}</div>
                </div>
              </div>
            ))}
            {isOwner && (
              <motion.div
                whileHover={{ scale: 1.04 }}
                onClick={() => setShowAddWantToListen(true)}
                style={{ width: '100px', aspectRatio: '1/1', border: '0.5px dashed #333', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#444', fontSize: '24px' }}
              >
                +
              </motion.div>
            )}
            {!isOwner && wantToListen.length === 0 && (
              <p style={{ fontSize: '13px', color: '#333' }}>Nenhum álbum na lista ainda.</p>
            )}
          </div>
        </div>

        {/* Abas */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '32px', paddingTop: '24px' }}>
          <div>
            {/* Tab bar */}
            <div style={{ display: 'flex', borderBottom: '0.5px solid #222', marginBottom: '20px' }}>
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    padding: '10px 16px', fontSize: '13px', fontWeight: 500,
                    color: activeTab === tab.key ? '#fff' : '#555',
                    borderBottom: activeTab === tab.key ? '2px solid #1d4ed8' : '2px solid transparent',
                    marginBottom: '-0.5px', transition: 'all 0.15s',
                    display: 'flex', alignItems: 'center', gap: '6px',
                  }}
                >
                  {tab.label}
                  <span style={{
                    fontSize: '11px', fontWeight: 600,
                    color: activeTab === tab.key ? '#60a5fa' : '#333',
                    background: activeTab === tab.key ? '#1d4ed822' : '#222',
                    borderRadius: '10px', padding: '1px 6px',
                  }}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Aba: Avaliações */}
            {activeTab === 'reviews' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginBottom: '16px', gap: '8px' }}>
                  <div style={{ position: 'relative' }}>
                    <select
                      value={sortOrder}
                      onChange={e => setSortOrder(e.target.value as any)}
                      style={{ background: '#1a1a1a', border: '0.5px solid #2a2a2a', borderRadius: '6px', padding: '4px 24px 4px 8px', fontSize: '11px', color: '#888', cursor: 'pointer', outline: 'none', appearance: 'none' }}
                    >
                      <option value="recent">Mais recentes</option>
                      <option value="high">Nota mais alta</option>
                      <option value="low">Nota mais baixa</option>
                    </select>
                    <ChevronDown size={10} color="#555" style={{ position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  </div>
                  <div style={{ display: 'flex', gap: '2px', background: '#1a1a1a', borderRadius: '6px', padding: '2px', border: '0.5px solid #2a2a2a' }}>
                    <motion.button whileTap={{ scale: 0.9 }} onClick={() => setViewMode('list')} style={{ background: viewMode === 'list' ? '#2a2a2a' : 'transparent', border: 'none', borderRadius: '4px', padding: '4px 6px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: viewMode === 'list' ? '#fff' : '#555' }}>
                      <List size={13} />
                    </motion.button>
                    <motion.button whileTap={{ scale: 0.9 }} onClick={() => setViewMode('grid')} style={{ background: viewMode === 'grid' ? '#2a2a2a' : 'transparent', border: 'none', borderRadius: '4px', padding: '4px 6px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: viewMode === 'grid' ? '#fff' : '#555' }}>
                      <LayoutGrid size={13} />
                    </motion.button>
                  </div>
                </div>
                {reviews.length === 0 ? (
                  <p style={{ fontSize: '13px', color: '#444', textAlign: 'center', padding: '40px' }}>Nenhuma avaliação ainda.</p>
                ) : viewMode === 'list' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {sortedReviews.map((review, i) => (
                      <motion.div key={review.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} onClick={() => router.push(`/album/${review.albumId}`)} style={{ background: '#202020', border: '0.5px solid #1a1a1a', borderRadius: '8px', padding: '12px', display: 'flex', gap: '12px', cursor: 'pointer' }} whileHover={{ borderColor: '#2a2a2a' }}>
                        <AlbumCover coverUrl={review.album?.coverUrl} title={review.album?.title ?? ''} size={52} borderRadius={4} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                            <div>
                              <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{review.album?.title}</div>
                              <div style={{ fontSize: '11px', color: '#555' }}>{review.album?.artist?.name}</div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                              <ScoreBadge score={review.score} size="sm" />
                              <TimeAgo date={review.createdAt} />
                            </div>
                          </div>
                          {review.content && <p style={{ fontSize: '12px', color: '#777', fontStyle: 'italic', lineHeight: 1.5, marginTop: '6px' }}>"{review.content.slice(0, 120)}{review.content.length > 120 ? '...' : ''}"</p>}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '12px' }}>
                    {sortedReviews.map((review, i) => (
                      <motion.div key={review.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }} onClick={() => router.push(`/album/${review.albumId}`)} style={{ cursor: 'pointer', position: 'relative' }} whileHover={{ scale: 1.04 }}>
                        <div style={{ position: 'relative', borderRadius: '6px', overflow: 'hidden' }}>
                          <AlbumCover coverUrl={review.album?.coverUrl} title={review.album?.title ?? ''} size="100%" borderRadius={6} />
                          <div style={{ position: 'absolute', bottom: '4px', right: '4px' }}>
                            <ScoreBadge score={review.score} size="sm" />
                          </div>
                        </div>
                        <div style={{ marginTop: '5px', fontSize: '11px', color: '#ccc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{review.album?.title}</div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Aba: Publicações */}
            {activeTab === 'posts' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {posts.length === 0 ? (
                  <p style={{ fontSize: '13px', color: '#444', textAlign: 'center', padding: '40px' }}>Nenhuma publicação ainda.</p>
                ) : posts.map((post) => (
                  <motion.div key={post.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ background: '#202020', border: '0.5px solid #1a1a1a', borderRadius: '8px', padding: '12px' }} whileHover={{ borderColor: '#2a2a2a' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                      <AlbumCover coverUrl={post.album?.coverUrl} title={post.album?.title ?? ''} size={44} borderRadius={4} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', cursor: 'pointer' }} onClick={() => router.push(`/album/${post.albumId}`)}>
                          {post.album?.title}
                        </div>
                        <div style={{ fontSize: '11px', color: '#555' }}>{post.album?.artist?.name}</div>
                      </div>
                      <TimeAgo date={post.createdAt} />
                    </div>
                    <p style={{ fontSize: '13px', color: '#ccc', lineHeight: 1.6 }}>{post.content}</p>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Aba: Listas */}
            {activeTab === 'lists' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {lists.length === 0 ? (
                  <p style={{ fontSize: '13px', color: '#444', textAlign: 'center', padding: '40px' }}>Nenhuma lista ainda.</p>
                ) : lists.map((list) => (
                  <motion.div key={list.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ background: '#202020', border: '0.5px solid #1a1a1a', borderRadius: '8px', padding: '14px' }} whileHover={{ borderColor: '#2a2a2a' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <div>
                        <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#fff', fontFamily: 'Playfair Display, serif', marginBottom: '2px' }}>{list.title}</h3>
                        {list.description && <p style={{ fontSize: '12px', color: '#555', lineHeight: 1.5 }}>{list.description}</p>}
                      </div>
                      <TimeAgo date={list.createdAt} />
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {list.items.slice(0, 5).map((item: any, index: number) => (
                        <div key={item.id} onClick={() => router.push(`/album/${item.albumId}`)} style={{ cursor: 'pointer', position: 'relative' }}>
                          <div style={{ position: 'relative' }}>
                            <AlbumCover coverUrl={item.album?.coverUrl} title={item.album?.title ?? ''} size={56} borderRadius={4} />
                            <div style={{ position: 'absolute', top: '2px', left: '2px', fontSize: '10px', fontWeight: 700, color: '#fff', background: 'rgba(0,0,0,0.7)', borderRadius: '3px', padding: '1px 4px' }}>
                              {index + 1}
                            </div>
                          </div>
                        </div>
                      ))}
                      {list.items.length > 5 && (
                        <div style={{ width: '56px', height: '56px', background: '#2a2a2a', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#555' }}>
                          +{list.items.length - 5}
                        </div>
                      )}
                    </div>
                    <div style={{ marginTop: '8px', fontSize: '11px', color: '#444' }}>{list.items.length} álbum{list.items.length !== 1 ? 'ns' : ''}</div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar artistas */}
          <div>
            <div style={{ fontSize: '11px', color: '#555', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '16px' }}>
              Artistas seguidos
            </div>
            {followingArtists.length === 0 ? (
              <p style={{ fontSize: '13px', color: '#444' }}>Nenhum artista seguido.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {followingArtists.map((follow) => (
                  <motion.div key={follow.id} whileHover={{ x: 4 }} onClick={() => router.push(`/artist/${follow.followingArtist?.spotifyId}`)} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <AlbumCover coverUrl={follow.followingArtist?.imageUrl} title={follow.followingArtist?.name ?? ''} size={36} borderRadius={18} />
                    <span style={{ fontSize: '13px', color: '#ccc' }}>{follow.followingArtist?.name}</span>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showAddFavorite && (
        <AddAlbumModal title="Adicionar aos favoritos" onClose={() => setShowAddFavorite(false)} onSelect={handleAddFavorite} />
      )}

      {showAddWantToListen && (
        <AddAlbumModal title="Adicionar à lista" onClose={() => setShowAddWantToListen(false)} onSelect={handleAddWantToListen} />
      )}

      {followersModal && (
        <FollowersModal userId={profile.id} tab={followersModal} onClose={() => setFollowersModal(null)} />
      )}
    </div>
  )
}