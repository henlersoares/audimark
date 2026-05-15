import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common'
import { SpotifyService } from './spotify.service'
import { AuthGuard } from '@nestjs/passport'

@UseGuards(AuthGuard('jwt'))
@Controller('spotify')
export class SpotifyController {
  constructor(private spotifyService: SpotifyService) {}

  @Get('search')
  search(@Query('q') query: string) {
    return this.spotifyService.searchArtists(query)
  }

  @Get('artists/:id')
  getArtist(@Param('id') id: string) {
    return this.spotifyService.getArtist(id)
  }

  @Get('artists/:id/albums')
  getAlbums(@Param('id') id: string) {
    return this.spotifyService.getArtistAlbums(id)
  }
}