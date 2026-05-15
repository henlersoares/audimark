import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common'
import { ArtistsService } from './artists.service'
import { AuthGuard } from '@nestjs/passport'

@UseGuards(AuthGuard('jwt'))
@Controller('artists')
export class ArtistsController {
  constructor(private artistsService: ArtistsService) {}

  @Get('search')
  search(@Query('q') query: string) {
    return this.artistsService.search(query)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.artistsService.findOne(id)
  }
}