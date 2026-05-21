import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { NotificationsService } from '../notifications/notifications.service'

@Injectable()
export class LikesService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  async likeReview(userId: string, reviewId: string) {
    const existing = await this.prisma.like.findUnique({
      where: { userId_reviewId: { userId, reviewId } },
    })

    if (existing) {
      await this.prisma.like.delete({
        where: { userId_reviewId: { userId, reviewId } },
      })
      return { liked: false }
    }

    await this.prisma.like.create({ data: { userId, reviewId } })

    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
      include: { album: true, user: true },
    })

    if (review && review.userId !== userId) {
      const liker = await this.prisma.user.findUnique({ where: { id: userId } })
      await this.notifications.create({
        userId: review.userId,
        type: 'like_review',
        message: `@${liker?.username} curtiu sua avaliação de ${review.album.title}`,
        link: `/album/${review.albumId}`,
      })
    }

    return { liked: true }
  }

  async getLikeStatus(userId: string, reviewId: string) {
    const like = await this.prisma.like.findUnique({
      where: { userId_reviewId: { userId, reviewId } },
    })
    const count = await this.prisma.like.count({ where: { reviewId } })
    return { liked: !!like, count }
  }

  async likeComment(userId: string, commentId: string) {
    const existing = await this.prisma.commentLike.findUnique({
      where: { userId_commentId: { userId, commentId } },
    })

    if (existing) {
      await this.prisma.commentLike.delete({
        where: { userId_commentId: { userId, commentId } },
      })
      return { liked: false }
    }

    await this.prisma.commentLike.create({ data: { userId, commentId } })
    return { liked: true }
  }
}