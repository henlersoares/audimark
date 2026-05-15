import { Module } from '@nestjs/common'
import { ArtistsService } from './artists.service'
import { ArtistsController } from './artists.controller'
import { SpotifyModule } from '../spotify/spotify.module'

@Module({
  imports: [SpotifyModule],
  providers: [ArtistsService],
  controllers: [ArtistsController],
  exports: [ArtistsService],
})
export class ArtistsModule {}