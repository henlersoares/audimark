'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Calendar, Music, Building2, Clock } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import AlbumCover from '@/components/ui/AlbumCover'
import ReviewModal from '@/components/feed/ReviewModal'
import ScoreBadge from '@/components/ui/ScoreBadge'
import Avatar from '@/components/ui/Avatar'
import TimeAgo from '@/components/ui/TimeAgo'
import api from '@/lib/api'

interface Track {
    id: string
    number: number
    name: string
    durationMs: number
}

interface AlbumDetail {
    spotifyId: string
    title: string
    coverUrl: string
    releaseDate: string
    totalTracks: number
    albumType: string
    label?: string
    artist: {
        spotifyId: string
        name: string
        imageUrl?: string
    }
    tracks: Track[]
    reviews: any[]
}

function formatDuration(ms: number) {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

function formatDate(dateStr: string) {
    const date = new Date(dateStr)
    return date.toLocaleDateString('pt-BR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    })
}

export default function AlbumPage() {
    const { id } = useParams<{ id: string }>()
    const router = useRouter()
    const [album, setAlbum] = useState<AlbumDetail | null>(null)
    const [showReviewModal, setShowReviewModal] = useState(false)
    const [score, setScore] = useState<{ average: number | null; count: number }>({ average: null, count: 0 })
    const [streamingLinks, setStreamingLinks] = useState<{
        spotify: string | null
        appleMusic: string | null
        youtubeMusic: string | null
        tidal: string | null
        qobuz: string | null
        deezer: string | null
    } | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadAlbum()
    }, [id])

    const loadAlbum = async () => {
        try {
            const [albumRes, scoreRes] = await Promise.all([
                api.get(`/albums/${id}`),
                api.get(`/albums/${id}/score`),
            ])
            setAlbum(albumRes.data)
            setScore(scoreRes.data)

            // Busca streaming separado pra não quebrar a página
            try {
                const streamingRes = await api.get(`/albums/${id}/streaming`)
                setStreamingLinks(streamingRes.data)
            } catch {
                console.log('Links de streaming indisponíveis')
            }
        } catch {
            console.error('Erro ao carregar álbum')
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

    if (!album) return null

    const totalDurationMs = album.tracks.reduce((acc, t) => acc + t.durationMs, 0)
    const totalMinutes = Math.floor(totalDurationMs / 60000)

    return (
        <div style={{ minHeight: '100vh', background: '#0a0a0a' }}>
            <Navbar />

            <div style={{ maxWidth: '600px', margin: '0 auto' }}>

                {/* Header */}
                <div style={{ padding: '20px', borderBottom: '0.5px solid #161616' }}>
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => router.back()}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555', display: 'flex', marginBottom: '16px' }}
                    >
                        <ArrowLeft size={20} />
                    </motion.button>

                    <div style={{ display: 'flex', gap: '16px' }}>
                        <AlbumCover coverUrl={album.coverUrl} title={album.title} size={100} borderRadius={6} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <h1 style={{ fontSize: '20px', fontFamily: 'Playfair Display, serif', color: '#fff', marginBottom: '4px', lineHeight: 1.2 }}>
                                {album.title}
                            </h1>
                            <div
                                onClick={() => router.push(`/artist/${album.artist.spotifyId}`)}
                                style={{ fontSize: '13px', color: '#60a5fa', marginBottom: '10px', cursor: 'pointer' }}
                            >
                                {album.artist.name}
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#555' }}>
                                    <Calendar size={12} />
                                    {formatDate(album.releaseDate)}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#555' }}>
                                    <Music size={12} />
                                    {album.totalTracks} faixas · {totalMinutes} min
                                </div>
                                {album.label && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#555' }}>
                                        <Building2 size={12} />
                                        {album.label}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Score médio */}
                    {score.average !== null && (
                        <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <ScoreBadge score={score.average} size="lg" />
                            <span style={{ fontSize: '12px', color: '#555' }}>
                                {score.count} avaliações no Audimark
                            </span>
                        </div>
                    )}

                    {/* Links de streaming */}
                    {streamingLinks && (
                        <div style={{ marginTop: '14px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {streamingLinks.spotify && (
                                <motion.a
                                    href={streamingLinks.spotify}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    whileHover={{ opacity: 0.85 }}
                                    whileTap={{ scale: 0.95 }}
                                    style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#1DB954', color: '#000', borderRadius: '6px', padding: '5px 10px', fontSize: '11px', fontWeight: 600, textDecoration: 'none' }}
                                >
                                    Spotify
                                </motion.a>
                            )}
                            {streamingLinks.appleMusic && (
                                <motion.a
                                    href={streamingLinks.appleMusic}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    whileHover={{ opacity: 0.85 }}
                                    whileTap={{ scale: 0.95 }}
                                    style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#fc3c44', color: '#fff', borderRadius: '6px', padding: '5px 10px', fontSize: '11px', fontWeight: 600, textDecoration: 'none' }}
                                >
                                    Apple Music
                                </motion.a>
                            )}
                            {streamingLinks.youtubeMusic && (
                                <motion.a
                                    href={streamingLinks.youtubeMusic}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    whileHover={{ opacity: 0.85 }}
                                    whileTap={{ scale: 0.95 }}
                                    style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#FF0000', color: '#fff', borderRadius: '6px', padding: '5px 10px', fontSize: '11px', fontWeight: 600, textDecoration: 'none' }}
                                >
                                    YouTube Music
                                </motion.a>
                            )}
                            {streamingLinks.tidal && (
                                <motion.a
                                    href={streamingLinks.tidal}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    whileHover={{ opacity: 0.85 }}
                                    whileTap={{ scale: 0.95 }}
                                    style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#000', color: '#fff', border: '0.5px solid #333', borderRadius: '6px', padding: '5px 10px', fontSize: '11px', fontWeight: 600, textDecoration: 'none' }}
                                >
                                    Tidal
                                </motion.a>
                            )}
                            {streamingLinks.qobuz && (
                                <motion.a
                                    href={streamingLinks.qobuz}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    whileHover={{ opacity: 0.85 }}
                                    whileTap={{ scale: 0.95 }}
                                    style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#00a0ff', color: '#fff', borderRadius: '6px', padding: '5px 10px', fontSize: '11px', fontWeight: 600, textDecoration: 'none' }}
                                >
                                    Qobuz
                                </motion.a>
                            )}
                            {streamingLinks.deezer && (
                                <motion.a
                                    href={streamingLinks.deezer}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    whileHover={{ opacity: 0.85 }}
                                    whileTap={{ scale: 0.95 }}
                                    style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#a238ff', color: '#fff', borderRadius: '6px', padding: '5px 10px', fontSize: '11px', fontWeight: 600, textDecoration: 'none' }}
                                >
                                    Deezer
                                </motion.a>
                            )}
                        </div>
                    )}
                    {/* Botão avaliar */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowReviewModal(true)}
                        style={{
                            marginTop: '14px',
                            width: '100%',
                            background: '#1d4ed8',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '10px',
                            fontSize: '13px',
                            fontWeight: 600,
                            cursor: 'pointer',
                        }}
                    >
                        Avaliar este álbum
                    </motion.button>
                </div>

                {/* Faixas */}
                <div style={{ padding: '20px', borderBottom: '0.5px solid #161616' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                        <Music size={13} color="#555" />
                        <span style={{ fontSize: '11px', color: '#555', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                            Faixas
                        </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        {album.tracks.map((track, i) => (
                            <motion.div
                                key={track.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: i * 0.02 }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '8px 6px',
                                    borderRadius: '6px',
                                    cursor: 'default',
                                }}
                                whileHover={{ background: '#111' }}
                            >
                                <span style={{ fontSize: '12px', color: '#444', width: '20px', textAlign: 'right', flexShrink: 0 }}>
                                    {track.number}
                                </span>
                                <span style={{ fontSize: '13px', color: '#ccc', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {track.name}
                                </span>
                                <span style={{ fontSize: '12px', color: '#444', display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                                    <Clock size={11} />
                                    {formatDuration(track.durationMs)}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Reviews */}
                <div style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                        <span style={{ fontSize: '11px', color: '#555', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                            Avaliações
                        </span>
                        <span style={{ fontSize: '11px', color: '#333' }}>({album.reviews.length})</span>
                    </div>

                    {album.reviews.length === 0 ? (
                        <p style={{ fontSize: '13px', color: '#444', textAlign: 'center', padding: '20px' }}>
                            Nenhuma avaliação ainda. Seja o primeiro!
                        </p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {album.reviews.map((review) => (
                                <motion.div
                                    key={review.id}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    style={{ background: '#111', border: '0.5px solid #1a1a1a', borderRadius: '8px', padding: '12px' }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                        <Avatar username={review.user.username} avatarUrl={review.user.avatarUrl} size={28} />
                                        <div style={{ flex: 1 }}>
                                            <span style={{ fontSize: '13px', color: '#fff', fontWeight: 500 }}>{review.user.username}</span>
                                        </div>
                                        <ScoreBadge score={review.score} size="sm" />
                                        <TimeAgo date={review.createdAt} />
                                    </div>
                                    {review.content && (
                                        <p style={{ fontSize: '13px', color: '#777', lineHeight: 1.6, fontStyle: 'italic' }}>
                                            "{review.content}"
                                        </p>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
            {showReviewModal && (
                <ReviewModal
                    album={album}
                    onClose={() => setShowReviewModal(false)}
                    onSuccess={loadAlbum}
                />
            )}
        </div>
    )
}