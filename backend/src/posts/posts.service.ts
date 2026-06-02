import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, data: { albumId: string; content: string }) {
    await this.prisma.album.findUniqueOrThrow({ where: { spotifyId: data.albumId } })

    return this.prisma.post.create({
      data: { userId, albumId: data.albumId, content: data.content },
      include: {
        user: { select: { id: true, username: true, avatarUrl: true } },
        album: { include: { artist: true } },
        likes: true,
      },
    })
  }

  async getFeed(userId: string) {
    const following = await this.prisma.follow.findMany({
      where: { followerId: userId, followingUserId: { not: null } },
      select: { followingUserId: true },
    })

    const userIds = [userId, ...following.map(f => f.followingUserId!)]

    return this.prisma.post.findMany({
      where: { userId: { in: userIds } },
      include: {
        user: { select: { id: true, username: true, avatarUrl: true } },
        album: { include: { artist: true } },
        likes: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
  }

  async getByUser(userId: string) {
    return this.prisma.post.findMany({
      where: { userId },
      include: {
        user: { select: { id: true, username: true, avatarUrl: true } },
        album: { include: { artist: true } },
        likes: true,
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async toggleLike(userId: string, postId: string) {
    const existing = await this.prisma.postLike.findUnique({
      where: { userId_postId: { userId, postId } },
    })

    if (existing) {
      await this.prisma.postLike.delete({ where: { userId_postId: { userId, postId } } })
      return { liked: false }
    }

    await this.prisma.postLike.create({ data: { userId, postId } })
    return { liked: true }
  }

  async getLikeStatus(userId: string, postId: string) {
    const like = await this.prisma.postLike.findUnique({
      where: { userId_postId: { userId, postId } },
    })
    const count = await this.prisma.postLike.count({ where: { postId } })
    return { liked: !!like, count }
  }

  async delete(userId: string, postId: string) {
    return this.prisma.post.deleteMany({ where: { id: postId, userId } })
  }
}