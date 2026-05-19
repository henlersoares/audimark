import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) { }

  async getComments(reviewId: string) {
    return this.prisma.comment.findMany({
      where: { reviewId, parentId: null },
      include: {
        user: { select: { id: true, username: true, avatarUrl: true } },
        replies: {
          include: {
            user: { select: { id: true, username: true, avatarUrl: true } },
            likes: true,
          },
          orderBy: { createdAt: 'asc' },
        },
        likes: true,
      },
      orderBy: { createdAt: 'asc' },
    })
  }

  async create(userId: string, reviewId: string, content: string, parentId?: string) {
    return this.prisma.comment.create({
      data: { userId, reviewId, content, parentId },
      include: {
        user: { select: { id: true, username: true, avatarUrl: true } },
        likes: true,
      },
    })
  }

  async delete(id: string, userId: string) {
    const comment = await this.prisma.comment.findUnique({ where: { id } })
    if (!comment) throw new NotFoundException('Comentário não encontrado')
    if (comment.userId !== userId) throw new ForbiddenException('Sem permissão')
    return this.prisma.comment.delete({ where: { id } })
  }
}