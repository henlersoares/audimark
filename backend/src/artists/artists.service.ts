import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { SpotifyService } from '../spotify/spotify.service'

@Injectable()
export class ArtistsService {
  constructor(
    private prisma: PrismaService,
    private spotify: SpotifyService,
  ) {}

  async search(query: string) {
    const spotifyResults = await this.spotify.searchArtists(query)

    const artists = await Promise.all(
      spotifyResults.map(async (artist: any) => {
        const existing = await this.prisma.artist.findUnique({
          where: { spotifyId: artist.spotifyId },
        })

        if (existing) return existing

        return this.prisma.artist.create({
          data: {
            spotifyId: artist.spotifyId,
            name: artist.name,
            imageUrl: artist.imageUrl,
            genres: artist.genres,
          },
        })
      }),
    )

    return artists
  }

  async findOne(spotifyId: string) {
    const existing = await this.prisma.artist.findUnique({
      where: { spotifyId },
      include: { albums: true },
    })

    if (existing) return existing

    const artist = await this.spotify.getArtist(spotifyId)
    const albums = await this.spotify.getArtistAlbums(spotifyId)

    const created = await this.prisma.artist.create({
      data: {
        spotifyId: artist.spotifyId,
        name: artist.name,
        imageUrl: artist.imageUrl,
        genres: artist.genres,
        albums: {
          create: albums.map((album: any) => ({
            spotifyId: album.spotifyId,
            title: album.title,
            coverUrl: album.coverUrl,
            releaseDate: album.releaseDate,
            totalTracks: album.totalTracks,
            albumType: album.albumType,
          })),
        },
      },
      include: { albums: true },
    })

    return created
  }
}