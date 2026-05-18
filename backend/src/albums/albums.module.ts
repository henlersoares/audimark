import { Module } from '@nestjs/common'
import { AlbumsService } from './albums.service'
import { AlbumsController } from './albums.controller'
import { SpotifyModule } from '../spotify/spotify.module'

@Module({
  imports: [SpotifyModule],
  providers: [AlbumsService],
  controllers: [AlbumsController],
  exports: [AlbumsService],
})
export class AlbumsModule {}