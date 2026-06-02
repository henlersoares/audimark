import { Controller, Post, Get, Delete, Param, Body, Request, UseGuards } from '@nestjs/common'
import { ListsService } from './lists.service'
import { AuthGuard } from '@nestjs/passport'

@UseGuards(AuthGuard('jwt'))
@Controller('lists')
export class ListsController {
  constructor(private listsService: ListsService) {}

  @Post()
  create(@Request() req, @Body() body: { title: string; description?: string; items: { albumId: string; note?: string }[] }) {
    return this.listsService.create(req.user.id, body)
  }

  @Get('feed')
  getFeed(@Request() req) {
    return this.listsService.getFeed(req.user.id)
  }

  @Get('user/:userId')
  getByUser(@Param('userId') userId: string) {
    return this.listsService.getByUser(userId)
  }

  @Post(':listId/like')
  toggleLike(@Request() req, @Param('listId') listId: string) {
    return this.listsService.toggleLike(req.user.id, listId)
  }

  @Get(':listId/like')
  getLikeStatus(@Request() req, @Param('listId') listId: string) {
    return this.listsService.getLikeStatus(req.user.id, listId)
  }

  @Delete(':listId')
  delete(@Request() req, @Param('listId') listId: string) {
    return this.listsService.delete(req.user.id, listId)
  }
}