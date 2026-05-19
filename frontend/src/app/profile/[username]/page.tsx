'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Calendar, Music, Users, Edit2 } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Avatar from '@/components/ui/Avatar'
import ScoreBadge from '@/components/ui/ScoreBadge'
import AlbumCover from '@/components/ui/AlbumCover'
import TimeAgo from '@/components/ui/TimeAgo'
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

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>()
  const router = useRouter()
  const { user } = useAuthStore()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [reviews, setReviews] = useState<any[]>([])
  const [followingArtists, setFollowingArtists] = useState<any[]>([])
  const [favorites, setFavorites] = useState<any[]>([])
  const [wantToListen, setWantToListen] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const isOwner = user?.username === username

  useEffect(() => {
    loadProfile()
  }, [username])

  const loadProfile = async () => {
    try {
      const profileRes = await api.get(`/users/${username}`)
      setProfile(profileRes.data)

      const [reviewsRes, artistsRes, favRes, wantRes] = await Promise.all([
        api.get(`/reviews/user/${profileRes.data.id}`),
        api.get('/follows/artists'),
        api.get('/favorites'),
        api.get('/favorites/want-to-listen'),
      ])

      setReviews(reviewsRes.data)
      setFollowingArtists(artistsRes.data)
      setFavorites(favRes.data)
      setWantToListen(wantRes.data)
    } catch {
      console.error('Erro ao carregar perfil')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0a' }}>
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

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a' }}>
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
              {isOwner && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push('/settings')}
                  style={{ background: 'transparent', border: '0.5px solid #333', borderRadius: '6px', padding: '4px 10px', fontSize: '11px', color: '#888', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Edit2 size={11} /> Editar perfil
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
          {favorites.length === 0 ? (
            <p style={{ fontSize: '13px', color: '#333' }}>
              {isOwner ? 'Adicione seus álbuns favoritos na página do álbum.' : 'Nenhum álbum favorito ainda.'}
            </p>
          ) : (
            <div style={{ display: 'flex', gap: '12px' }}>
              {favorites.map((fav) => (
                <motion.div
                  key={fav.id}
                  whileHover={{ scale: 1.04 }}
                  onClick={() => router.push(`/album/${fav.albumId}`)}
                  style={{ cursor: 'pointer', width: '120px' }}
                >
                  <AlbumCover coverUrl={fav.album?.coverUrl} title={fav.album?.title ?? ''} size="100%" borderRadius={6} />
                  <div style={{ marginTop: '6px' }}>
                    <div style={{ fontSize: '12px', color: '#ccc', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {fav.album?.title}
                    </div>
                    <div style={{ fontSize: '11px', color: '#555' }}>{fav.album?.artist?.name}</div>
                  </div>
                </motion.div>
              ))}
              {isOwner && favorites.length < 5 && (
                <div style={{ width: '120px', aspectRatio: '1/1', border: '0.5px dashed #333', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#444', fontSize: '24px' }}
                  onClick={() => router.push('/search')}
                >
                  +
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quero ouvir */}
        <div style={{ padding: '24px 0', borderBottom: '0.5px solid #161616' }}>
          <div style={{ fontSize: '11px', color: '#555', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '16px' }}>
            Quero ouvir
          </div>
          {wantToListen.length === 0 ? (
            <p style={{ fontSize: '13px', color: '#333' }}>
              {isOwner ? 'Adicione álbuns que quer ouvir na página do álbum.' : 'Nenhum álbum na lista ainda.'}
            </p>
          ) : (
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {wantToListen.map((item) => (
                <motion.div
                  key={item.id}
                  whileHover={{ scale: 1.04 }}
                  onClick={() => router.push(`/album/${item.albumId}`)}
                  style={{ cursor: 'pointer', width: '100px' }}
                >
                  <AlbumCover coverUrl={item.album?.coverUrl} title={item.album?.title ?? ''} size="100%" borderRadius={6} />
                  <div style={{ marginTop: '6px' }}>
                    <div style={{ fontSize: '11px', color: '#ccc', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.album?.title}
                    </div>
                    <div style={{ fontSize: '10px', color: '#555' }}>{item.album?.artist?.name}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '32px', paddingTop: '24px' }}>

          {/* Reviews */}
          <div>
            <div style={{ fontSize: '11px', color: '#555', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '16px' }}>
              Avaliações recentes
            </div>
            {reviews.length === 0 ? (
              <p style={{ fontSize: '13px', color: '#444', textAlign: 'center', padding: '40px' }}>Nenhuma avaliação ainda.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {reviews.map((review, i) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => router.push(`/album/${review.albumId}`)}
                    style={{ background: '#111', border: '0.5px solid #1a1a1a', borderRadius: '8px', padding: '12px', display: 'flex', gap: '12px', cursor: 'pointer' }}
                    whileHover={{ borderColor: '#2a2a2a' }}
                  >
                    <AlbumCover coverUrl={review.album?.coverUrl} title={review.album?.title ?? ''} size={52} borderRadius={4} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {review.album?.title}
                          </div>
                          <div style={{ fontSize: '11px', color: '#555' }}>{review.album?.artist?.name}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                          <ScoreBadge score={review.score} size="sm" />
                          <TimeAgo date={review.createdAt} />
                        </div>
                      </div>
                      {review.content && (
                        <p style={{ fontSize: '12px', color: '#777', fontStyle: 'italic', lineHeight: 1.5, marginTop: '6px' }}>
                          "{review.content.slice(0, 120)}{review.content.length > 120 ? '...' : ''}"
                        </p>
                      )}
                    </div>
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
                  <motion.div
                    key={follow.id}
                    whileHover={{ x: 4 }}
                    onClick={() => router.push(`/artist/${follow.followingArtist?.spotifyId}`)}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
                  >
                    <AlbumCover coverUrl={follow.followingArtist?.imageUrl} title={follow.followingArtist?.name ?? ''} size={36} borderRadius={18} />
                    <span style={{ fontSize: '13px', color: '#ccc' }}>{follow.followingArtist?.name}</span>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}