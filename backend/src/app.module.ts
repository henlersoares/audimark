import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { PrismaModule } from './prisma/prisma.module'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { SpotifyModule } from './spotify/spotify.module'
import { ArtistsModule } from './artists/artists.module'
import { ReviewsModule } from './reviews/reviews.module'
import { FollowsModule } from './follows/follows.module'
import { AlbumsModule } from './albums/albums.module'

@Module({
  imports: [PrismaModule, AuthModule, UsersModule, SpotifyModule, ArtistsModule, ReviewsModule, FollowsModule, AlbumsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}