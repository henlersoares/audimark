import { Controller, Get, Post, Delete, Param, Body, Request, UseGuards } from '@nestjs/common'
import { CommentsService } from './comments.service'
import { AuthGuard } from '@nestjs/passport'

@UseGuards(AuthGuard('jwt'))
@Controller('comments')
export class CommentsController {
  constructor(private commentsService: CommentsService) {}

  @Get('reviews/:reviewId')
  getComments(@Param('reviewId') reviewId: string) {
    return this.commentsService.getComments(reviewId)
  }

  @Post('reviews/:reviewId')
  create(
    @Param('reviewId') reviewId: string,
    @Body() body: { content: string; parentId?: string },
    @Request() req,
  ) {
    return this.commentsService.create(req.user.id, reviewId, body.content, body.parentId)
  }

  @Delete(':id')
  delete(@Param('id') id: string, @Request() req) {
    return this.commentsService.delete(id, req.user.id)
  }
}