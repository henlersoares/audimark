import { Injectable, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}

  async getFavorites(userId: string) {
    return this.prisma.favoriteAlbum.findMany({
      where: { userId },
      include: { album: { include: { artist: true } } },
      orderBy: { order: 'asc' },
    })
  }

  async addFavorite(userId: string, albumId: string) {
    const count = await this.prisma.favoriteAlbum.count({ where: { userId } })
    if (count >= 5) throw new BadRequestException('Limite de 5 álbuns favoritos atingido')

    return this.prisma.favoriteAlbum.create({
      data: { userId, albumId, order: count + 1 },
      include: { album: { include: { artist: true } } },
    })
  }

  async removeFavorite(userId: string, albumId: string) {
    return this.prisma.favoriteAlbum.delete({
      where: { userId_albumId: { userId, albumId } },
    })
  }

  async getWantToListen(userId: string) {
    return this.prisma.wantToListen.findMany({
      where: { userId },
      include: { album: { include: { artist: true } } },
      orderBy: { createdAt: 'desc' },
    })
  }

  async addWantToListen(userId: string, albumId: string) {
    return this.prisma.wantToListen.create({
      data: { userId, albumId },
      include: { album: { include: { artist: true } } },
    })
  }

  async removeWantToListen(userId: string, albumId: string) {
    return this.prisma.wantToListen.delete({
      where: { userId_albumId: { userId, albumId } },
    })
  }
}