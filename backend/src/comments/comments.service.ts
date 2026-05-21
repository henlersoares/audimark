import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { NotificationsService } from '../notifications/notifications.service'

@Injectable()
export class CommentsService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) { }

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
    const comment = await this.prisma.comment.create({
      data: { userId, reviewId, content, parentId },
      include: {
        user: { select: { id: true, username: true, avatarUrl: true } },
        likes: true,
      },
    })

    const commenter = await this.prisma.user.findUnique({ where: { id: userId } })
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
      include: { album: true },
    })

    if (review && review.userId !== userId) {
      await this.notifications.create({
        userId: review.userId,
        type: 'comment_review',
        message: `@${commenter?.username} comentou na sua avaliação de ${review.album.title}`,
        link: `/album/${review.albumId}`,
      })
    }

    if (parentId) {
      const parentComment = await this.prisma.comment.findUnique({
        where: { id: parentId },
      })
      if (parentComment && parentComment.userId !== userId) {
        await this.notifications.create({
          userId: parentComment.userId,
          type: 'reply_comment',
          message: `@${commenter?.username} respondeu seu comentário`,
          link: `/album/${review?.albumId}`,
        })
      }
    }

    const mentions = content.match(/@(\w+)/g)
    if (mentions) {
      for (const mention of mentions) {
        const username = mention.slice(1)
        const mentionedUser = await this.prisma.user.findUnique({ where: { username } })
        if (mentionedUser && mentionedUser.id !== userId) {
          await this.notifications.create({
            userId: mentionedUser.id,
            type: 'mention',
            message: `@${commenter?.username} mencionou você em um comentário`,
            link: `/album/${review?.albumId}`,
          })
        }
      }
    }

    return comment
  }

  async delete(id: string, userId: string) {
    const comment = await this.prisma.comment.findUnique({ where: { id } })
    if (!comment) throw new NotFoundException('Comentário não encontrado')
    if (comment.userId !== userId) throw new ForbiddenException('Sem permissão')

    // Deleta likes das replies
    const replies = await this.prisma.comment.findMany({ where: { parentId: id } })
    for (const reply of replies) {
      await this.prisma.commentLike.deleteMany({ where: { commentId: reply.id } })
    }

    // Deleta as replies
    await this.prisma.comment.deleteMany({ where: { parentId: id } })

    // Deleta likes do comentário pai
    await this.prisma.commentLike.deleteMany({ where: { commentId: id } })

    // Deleta o comentário
    return this.prisma.comment.delete({ where: { id } })
  }
}