import { Controller, Get, Param, UseGuards } from '@nestjs/common'
import { AlbumsService } from './albums.service'
import { AuthGuard } from '@nestjs/passport'

@UseGuards(AuthGuard('jwt'))
@Controller('albums')
export class AlbumsController {
  constructor(private albumsService: AlbumsService) {}

  @Get(':id/score')
  getScore(@Param('id') id: string) {
    return this.albumsService.getScore(id)
  }

  @Get(':id/streaming')
  getStreamingLinks(@Param('id') id: string) {
    return this.albumsService.getStreamingLinks(id)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.albumsService.findOne(id)
  }
}