import { Controller, Post, Get, Delete, Param, Body, Request, UseGuards } from '@nestjs/common'
import { PostsService } from './posts.service'
import { AuthGuard } from '@nestjs/passport'

@UseGuards(AuthGuard('jwt'))
@Controller('posts')
export class PostsController {
  constructor(private postsService: PostsService) {}

  @Post()
  create(@Request() req, @Body() body: { albumId: string; content: string }) {
    return this.postsService.create(req.user.id, body)
  }

  @Get('feed')
  getFeed(@Request() req) {
    return this.postsService.getFeed(req.user.id)
  }

  @Get('user/:userId')
  getByUser(@Param('userId') userId: string) {
    return this.postsService.getByUser(userId)
  }

  @Post(':postId/like')
  toggleLike(@Request() req, @Param('postId') postId: string) {
    return this.postsService.toggleLike(req.user.id, postId)
  }

  @Get(':postId/like')
  getLikeStatus(@Request() req, @Param('postId') postId: string) {
    return this.postsService.getLikeStatus(req.user.id, postId)
  }

  @Delete(':postId')
  delete(@Request() req, @Param('postId') postId: string) {
    return this.postsService.delete(req.user.id, postId)
  }
}