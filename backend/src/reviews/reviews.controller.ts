import { Controller, Get, Post, Patch, Delete, Body, Param, Request, UseGuards } from '@nestjs/common'
import { ReviewsService } from './reviews.service'
import { AuthGuard } from '@nestjs/passport'

@UseGuards(AuthGuard('jwt'))
@Controller('reviews')
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) { }

  @Post()
  create(@Request() req, @Body() body: { albumId: string; score: number; content?: string; listenedAt?: Date }) {
    return this.reviewsService.create(req.user.id, body)
  }

  @Get('album/:albumId')
  findByAlbum(@Param('albumId') albumId: string) {
    return this.reviewsService.findByAlbum(albumId)
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.reviewsService.findByUser(userId)
  }

  @Get('album/:albumId/score')
  getScore(@Param('albumId') albumId: string) {
    return this.reviewsService.getAlbumScore(albumId)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Request() req, @Body() body: { score?: number; content?: string }) {
    return this.reviewsService.update(id, req.user.id, body)
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.reviewsService.remove(id, req.user.id)
  }

  @Get('feed')
  getFeed(@Request() req) {
    return this.reviewsService.getFeed(req.user.id)
  }
}