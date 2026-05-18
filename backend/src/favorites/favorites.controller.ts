import { Controller, Get, Post, Delete, Param, Request, UseGuards } from '@nestjs/common'
import { FavoritesService } from './favorites.service'
import { AuthGuard } from '@nestjs/passport'

@UseGuards(AuthGuard('jwt'))
@Controller('favorites')
export class FavoritesController {
  constructor(private favoritesService: FavoritesService) {}

  @Get()
  getFavorites(@Request() req) {
    return this.favoritesService.getFavorites(req.user.id)
  }

  @Post(':albumId')
  addFavorite(@Param('albumId') albumId: string, @Request() req) {
    return this.favoritesService.addFavorite(req.user.id, albumId)
  }

  @Delete(':albumId')
  removeFavorite(@Param('albumId') albumId: string, @Request() req) {
    return this.favoritesService.removeFavorite(req.user.id, albumId)
  }

  @Get('want-to-listen')
  getWantToListen(@Request() req) {
    return this.favoritesService.getWantToListen(req.user.id)
  }

  @Post('want-to-listen/:albumId')
  addWantToListen(@Param('albumId') albumId: string, @Request() req) {
    return this.favoritesService.addWantToListen(req.user.id, albumId)
  }

  @Delete('want-to-listen/:albumId')
  removeWantToListen(@Param('albumId') albumId: string, @Request() req) {
    return this.favoritesService.removeWantToListen(req.user.id, albumId)
  }
}