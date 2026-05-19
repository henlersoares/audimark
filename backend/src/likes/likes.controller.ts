import { Controller, Post, Get, Param, Request, UseGuards } from '@nestjs/common'
import { LikesService } from './likes.service'
import { AuthGuard } from '@nestjs/passport'

@UseGuards(AuthGuard('jwt'))
@Controller('likes')
export class LikesController {
  constructor(private likesService: LikesService) {}

  @Post('reviews/:reviewId')
  likeReview(@Param('reviewId') reviewId: string, @Request() req) {
    return this.likesService.likeReview(req.user.id, reviewId)
  }

  @Get('reviews/:reviewId')
  getLikeStatus(@Param('reviewId') reviewId: string, @Request() req) {
    return this.likesService.getLikeStatus(req.user.id, reviewId)
  }

  @Post('comments/:commentId')
  likeComment(@Param('commentId') commentId: string, @Request() req) {
    return this.likesService.likeComment(req.user.id, commentId)
  }
}