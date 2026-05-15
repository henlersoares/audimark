import { Controller, Post, Delete, Get, Param, Request, UseGuards } from '@nestjs/common'
import { FollowsService } from './follows.service'
import { AuthGuard } from '@nestjs/passport'

@UseGuards(AuthGuard('jwt'))
@Controller('follows')
export class FollowsController {
  constructor(private followsService: FollowsService) {}

  @Post('artists/:artistId')
  followArtist(@Param('artistId') artistId: string, @Request() req) {
    return this.followsService.followArtist(req.user.id, artistId)
  }

  @Delete('artists/:artistId')
  unfollowArtist(@Param('artistId') artistId: string, @Request() req) {
    return this.followsService.unfollowArtist(req.user.id, artistId)
  }

  @Post('users/:userId')
  followUser(@Param('userId') userId: string, @Request() req) {
    return this.followsService.followUser(req.user.id, userId)
  }

  @Delete('users/:userId')
  unfollowUser(@Param('userId') userId: string, @Request() req) {
    return this.followsService.unfollowUser(req.user.id, userId)
  }

  @Get('artists')
  getFollowingArtists(@Request() req) {
    return this.followsService.getFollowingArtists(req.user.id)
  }

  @Get('users')
  getFollowingUsers(@Request() req) {
    return this.followsService.getFollowingUsers(req.user.id)
  }

  @Get('followers')
  getFollowers(@Request() req) {
    return this.followsService.getFollowers(req.user.id)
  }

  @Get('artists/:artistId/status')
  isFollowingArtist(@Param('artistId') artistId: string, @Request() req) {
    return this.followsService.isFollowingArtist(req.user.id, artistId)
  }
}