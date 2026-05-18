import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { SpotifyService } from '../spotify/spotify.service'

@Injectable()
export class AlbumsService {
    constructor(
        private prisma: PrismaService,
        private spotify: SpotifyService,
    ) { }

    async findOne(spotifyId: string) {
        const existing = await this.prisma.album.findUnique({
            where: { spotifyId },
            include: {
                artist: true,
                tracks: { orderBy: { number: 'asc' } },
                reviews: {
                    include: {
                        user: { select: { id: true, username: true, avatarUrl: true } },
                    },
                    orderBy: { createdAt: 'desc' },
                },
            },
        })

        if (existing && existing.tracks.length > 0) return existing

        const spotifyAlbum = await this.spotify.getAlbum(spotifyId)

        if (existing) {
            return this.prisma.album.update({
                where: { spotifyId },
                data: {
                    label: spotifyAlbum.label,
                    tracks: {
                        create: spotifyAlbum.tracks.map((track: any) => ({
                            number: track.number,
                            name: track.name,
                            durationMs: track.durationMs,
                        })),
                    },
                },
                include: {
                    artist: true,
                    tracks: { orderBy: { number: 'asc' } },
                    reviews: {
                        include: {
                            user: { select: { id: true, username: true, avatarUrl: true } },
                        },
                        orderBy: { createdAt: 'desc' },
                    },
                },
            })
        }

        const artist = await this.prisma.artist.findUnique({
            where: { spotifyId: spotifyAlbum.artistId },
        })

        if (!artist) {
            const spotifyArtist = await this.spotify.getArtist(spotifyAlbum.artistId)
            await this.prisma.artist.create({
                data: {
                    spotifyId: spotifyArtist.spotifyId,
                    name: spotifyArtist.name,
                    imageUrl: spotifyArtist.imageUrl,
                    genres: spotifyArtist.genres,
                },
            })
        }

        return this.prisma.album.create({
            data: {
                spotifyId: spotifyAlbum.spotifyId,
                title: spotifyAlbum.title,
                coverUrl: spotifyAlbum.coverUrl,
                releaseDate: spotifyAlbum.releaseDate,
                totalTracks: spotifyAlbum.totalTracks,
                albumType: spotifyAlbum.albumType,
                artistId: spotifyAlbum.artistId,
                label: spotifyAlbum.label,
                tracks: {
                    create: spotifyAlbum.tracks.map((track: any) => ({
                        number: track.number,
                        name: track.name,
                        durationMs: track.durationMs,
                    })),
                },
            },
            include: {
                artist: true,
                tracks: { orderBy: { number: 'asc' } },
                reviews: {
                    include: {
                        user: { select: { id: true, username: true, avatarUrl: true } },
                    },
                    orderBy: { createdAt: 'desc' },
                },
            },
        })
    }

    async getScore(spotifyId: string) {
        const result = await this.prisma.review.aggregate({
            where: { albumId: spotifyId },
            _avg: { score: true },
            _count: true,
        })

        return {
            average: result._avg.score,
            count: result._count,
        }
    }

    async getStreamingLinks(spotifyId: string) {
        return this.spotify.getStreamingLinks(spotifyId)
    }
}