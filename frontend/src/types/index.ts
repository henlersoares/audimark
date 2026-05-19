export interface User {
  id: string
  username: string
  email: string
  avatarUrl?: string
  bio?: string
  createdAt: string
}

export interface Artist {
  spotifyId: string
  name: string
  imageUrl?: string
  genres: string[]
}

export interface Album {
  spotifyId: string
  title: string
  coverUrl: string
  releaseDate: string
  totalTracks: number
  albumType: string
  artistId: string
  artist?: Artist
}

export interface Review {
  id: string
  userId: string
  albumId: string
  score: number
  content?: string
  listenedAt?: string
  createdAt: string
  updatedAt: string
  user?: Pick<User, 'id' | 'username' | 'avatarUrl'>
  album?: Album
}

export interface Follow {
  id: string
  followerId: string
  followingUserId?: string
  followingArtistId?: string
  createdAt: string
  followingArtist?: Artist
  followingUser?: Pick<User, 'id' | 'username' | 'avatarUrl'>
}

export interface User {
  id: string
  username: string
  email: string
  name?: string
  avatarUrl?: string
  bio?: string
  createdAt: string
}

export interface AuthResponse {
  user: User
  token: string
}