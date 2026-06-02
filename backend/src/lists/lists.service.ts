import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class ListsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, data: { title: string; description?: string; items: { albumId: string; note?: string }[] }) {
    return this.prisma.list.create({
      data: {
        userId,
        title: data.title,
        description: data.description,
        items: {
          create: data.items.map((item, index) => ({
            albumId: item.albumId,
            note: item.note,
            order: index + 1,
          })),
        },
      },
      include: {
        user: { select: { id: true, username: true, avatarUrl: true } },
        items: { include: { album: { include: { artist: true } } }, orderBy: { order: 'asc' } },
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

    return this.prisma.list.findMany({
      where: { userId: { in: userIds } },
      include: {
        user: { select: { id: true, username: true, avatarUrl: true } },
        items: { include: { album: { include: { artist: true } } }, orderBy: { order: 'asc' } },
        likes: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
  }

  async getByUser(userId: string) {
    return this.prisma.list.findMany({
      where: { userId },
      include: {
        user: { select: { id: true, username: true, avatarUrl: true } },
        items: { include: { album: { include: { artist: true } } }, orderBy: { order: 'asc' } },
        likes: true,
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async toggleLike(userId: string, listId: string) {
    const existing = await this.prisma.listLike.findUnique({
      where: { userId_listId: { userId, listId } },
    })

    if (existing) {
      await this.prisma.listLike.delete({ where: { userId_listId: { userId, listId } } })
      return { liked: false }
    }

    await this.prisma.listLike.create({ data: { userId, listId } })
    return { liked: true }
  }

  async getLikeStatus(userId: string, listId: string) {
    const like = await this.prisma.listLike.findUnique({
      where: { userId_listId: { userId, listId } },
    })
    const count = await this.prisma.listLike.count({ where: { listId } })
    return { liked: !!like, count }
  }

  async delete(userId: string, listId: string) {
    return this.prisma.list.deleteMany({ where: { id: listId, userId } })
  }
}