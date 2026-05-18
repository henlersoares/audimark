import { Injectable, Logger } from '@nestjs/common'
import * as dotenv from 'dotenv'

dotenv.config()

@Injectable()
export class SpotifyService {
  private readonly logger = new Logger(SpotifyService.name)
  private accessToken: string | null = null
  private tokenExpiresAt: number = 0

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiresAt) {
      return this.accessToken
    }

    const credentials = Buffer.from(
      `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
    ).toString('base64')

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    })

    const data = await response.json()
    this.accessToken = data.access_token
    this.tokenExpiresAt = Date.now() + data.expires_in * 1000

    return this.accessToken!
  }

  async searchArtists(query: string) {
    const token = await this.getAccessToken()

    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=artist&limit=10`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )

    const data = await response.json()
    return data.artists.items.map((artist: any) => ({
      spotifyId: artist.id,
      name: artist.name,
      imageUrl: artist.images?.[0]?.url ?? null,
      genres: artist.genres,
      externalUrl: artist.external_urls.spotify,
    }))
  }

  async getArtistAlbums(spotifyId: string) {
    const token = await this.getAccessToken()
    let allAlbums: any[] = []
    let offset = 0
    const limit = 5

    while (true) {
      const response = await fetch(
        `https://api.spotify.com/v1/artists/${spotifyId}/albums?include_groups=album&limit=${limit}&offset=${offset}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      const data = await response.json()

      if (!data.items || data.items.length === 0) break

      allAlbums = [...allAlbums, ...data.items]

      if (allAlbums.length >= data.total) break

      offset += limit
    }

    this.logger.log(`Total albums fetched: ${allAlbums.length}`)

    const seen = new Set<string>()
    return allAlbums
      .filter((album: any) => {
        const key = album.name.toLowerCase()
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
      .map((album: any) => ({
        spotifyId: album.id,
        title: album.name,
        coverUrl: album.images?.[0]?.url ?? null,
        releaseDate: new Date(album.release_date),
        totalTracks: album.total_tracks,
        albumType: album.album_type,
        artistId: spotifyId,
      }))
  }

  async getArtist(spotifyId: string) {
    const token = await this.getAccessToken()

    const response = await fetch(
      `https://api.spotify.com/v1/artists/${spotifyId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )

    const data = await response.json()
    return {
      spotifyId: data.id,
      name: data.name,
      imageUrl: data.images?.[0]?.url ?? null,
      genres: data.genres,
      externalUrl: data.external_urls.spotify,
    }
  }
  async getAlbum(spotifyId: string) {
    const token = await this.getAccessToken()

    const response = await fetch(
      `https://api.spotify.com/v1/albums/${spotifyId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )

    const data = await response.json()

    const tracks = data.tracks?.items?.map((track: any) => ({
      number: track.track_number,
      name: track.name,
      durationMs: track.duration_ms,
    })) ?? []

    return {
      spotifyId: data.id,
      title: data.name,
      coverUrl: data.images?.[0]?.url ?? null,
      releaseDate: new Date(data.release_date),
      totalTracks: data.total_tracks,
      albumType: data.album_type,
      artistId: data.artists?.[0]?.id,
      label: data.label ?? null,
      tracks,
    }
  }
  async getStreamingLinks(spotifyId: string) {
    const spotifyUrl = `https://open.spotify.com/album/${spotifyId}`

    const response = await fetch(
      `https://api.song.link/v1-alpha.1/links?url=${encodeURIComponent(spotifyUrl)}&userCountry=BR`,
    )

    const data = await response.json()

    const platforms = data.linksByPlatform ?? {}

    return {
      spotify: platforms.spotify?.url ?? null,
      appleMusic: platforms.appleMusic?.url ?? null,
      youtubeMusic: platforms.youtubeMusic?.url ?? null,
      tidal: platforms.tidal?.url ?? null,
      qobuz: platforms.qobuz?.url ?? null,
      deezer: platforms.deezer?.url ?? null,
    }
  }
}