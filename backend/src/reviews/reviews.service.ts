import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { SpotifyService } from '../spotify/spotify.service'

@Injectable()
export class ReviewsService {
  constructor(
    private prisma: PrismaService,
    private spotify: SpotifyService,
  ) {}

  async create(userId: string, data: { albumId: string; score: number; content?: string; listenedAt?: Date }) {
    let album = await this.prisma.album.findUnique({ where: { spotifyId: data.albumId } })

    if (!album) {
      const spotifyAlbum = await this.spotify.getAlbum(data.albumId)
      album = await this.prisma.album.create({ data: spotifyAlbum })
    }

    return this.prisma.review.create({
      data: {
        userId,
        albumId: data.albumId,
        score: data.score,
        content: data.content,
        listenedAt: data.listenedAt,
      },
      include: {
        user: { select: { id: true, username: true, avatarUrl: true } },
        album: true,
      },
    })
  }

  async findByAlbum(albumId: string) {
    return this.prisma.review.findMany({
      where: { albumId },
      include: {
        user: { select: { id: true, username: true, avatarUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findByUser(userId: string) {
    return this.prisma.review.findMany({
      where: { userId },
      include: {
        album: { include: { artist: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async update(id: string, userId: string, data: { score?: number; content?: string }) {
    const review = await this.prisma.review.findUnique({ where: { id } })

    if (!review) throw new NotFoundException('Review não encontrada')
    if (review.userId !== userId) throw new ForbiddenException('Sem permissão')

    return this.prisma.review.update({
      where: { id },
      data,
    })
  }

  async remove(id: string, userId: string) {
    const review = await this.prisma.review.findUnique({ where: { id } })

    if (!review) throw new NotFoundException('Review não encontrada')
    if (review.userId !== userId) throw new ForbiddenException('Sem permissão')

    return this.prisma.review.delete({ where: { id } })
  }

  async getAlbumScore(albumId: string) {
    const result = await this.prisma.review.aggregate({
      where: { albumId },
      _avg: { score: true },
      _count: true,
    })

    return {
      average: result._avg.score,
      count: result._count,
    }
  }
}