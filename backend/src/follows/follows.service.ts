import { Injectable, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class FollowsService {
  constructor(private prisma: PrismaService) {}

  async followArtist(followerId: string, artistId: string) {
    const existing = await this.prisma.follow.findFirst({
      where: { followerId, followingArtistId: artistId },
    })

    if (existing) throw new BadRequestException('Já está seguindo esse artista')

    return this.prisma.follow.create({
      data: { followerId, followingArtistId: artistId },
    })
  }

  async unfollowArtist(followerId: string, artistId: string) {
    const existing = await this.prisma.follow.findFirst({
      where: { followerId, followingArtistId: artistId },
    })

    if (!existing) throw new BadRequestException('Não está seguindo esse artista')

    return this.prisma.follow.delete({ where: { id: existing.id } })
  }

  async followUser(followerId: string, userId: string) {
    if (followerId === userId) throw new BadRequestException('Não pode seguir a si mesmo')

    const existing = await this.prisma.follow.findFirst({
      where: { followerId, followingUserId: userId },
    })

    if (existing) throw new BadRequestException('Já está seguindo esse usuário')

    return this.prisma.follow.create({
      data: { followerId, followingUserId: userId },
    })
  }

  async unfollowUser(followerId: string, userId: string) {
    const existing = await this.prisma.follow.findFirst({
      where: { followerId, followingUserId: userId },
    })

    if (!existing) throw new BadRequestException('Não está seguindo esse usuário')

    return this.prisma.follow.delete({ where: { id: existing.id } })
  }

  async getFollowingArtists(userId: string) {
    return this.prisma.follow.findMany({
      where: { followerId: userId, followingArtistId: { not: null } },
      include: { followingArtist: true },
    })
  }

  async getFollowingUsers(userId: string) {
    return this.prisma.follow.findMany({
      where: { followerId: userId, followingUserId: { not: null } },
      include: {
        followingUser: {
          select: { id: true, username: true, avatarUrl: true },
        },
      },
    })
  }

  async getFollowers(userId: string) {
    return this.prisma.follow.findMany({
      where: { followingUserId: userId },
      include: {
        follower: {
          select: { id: true, username: true, avatarUrl: true },
        },
      },
    })
  }

  async isFollowingArtist(followerId: string, artistId: string) {
    const existing = await this.prisma.follow.findFirst({
      where: { followerId, followingArtistId: artistId },
    })
    return { following: !!existing }
  }
}