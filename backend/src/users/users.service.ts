import { Injectable, ConflictException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import * as bcrypt from 'bcrypt'
import { v2 as cloudinary } from 'cloudinary'
import 'multer'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }

  async create(data: { username: string; email: string; password: string }) {
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: data.email }, { username: data.username }],
      },
    })

    if (existing) {
      throw new ConflictException('Email ou username já em uso')
    }

    const passwordHash = await bcrypt.hash(data.password, 10)

    return this.prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        passwordHash,
      },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        createdAt: true,
      },
    })
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } })
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        avatarUrl: true,
        bio: true,
        createdAt: true,
      },
    })
  }

  async findByUsername(username: string) {
    return this.prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        avatarUrl: true,
        bio: true,
        createdAt: true,
      },
    })
  }

  async search(query: string) {
    return this.prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: query, mode: 'insensitive' } },
          { name: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        username: true,
        name: true,
        avatarUrl: true,
      },
      take: 10,
    })
  }

  async update(id: string, data: { name?: string; bio?: string; avatarUrl?: string }) {
    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        avatarUrl: true,
        bio: true,
        createdAt: true,
      },
    })
  }
  async uploadAvatar(userId: string, file: any) {
    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'audimark/avatars',
          public_id: `avatar_${userId}`,
          overwrite: true,
          transformation: [{ width: 200, height: 200, crop: 'fill', gravity: 'face' }],
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      ).end(file.buffer)
    })

    return this.update(userId, { avatarUrl: result.secure_url })
  }

  async changeUsername(userId: string, newUsername: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new Error('Usuário não encontrado')

    if (user.usernameChangeCount >= 3) {
      throw new BadRequestException('Limite de 3 alterações de username atingido')
    }

    if (user.usernameChangedAt) {
      const daysSinceLastChange = (Date.now() - user.usernameChangedAt.getTime()) / (1000 * 60 * 60 * 24)
      if (daysSinceLastChange < 30) {
        const daysRemaining = Math.ceil(30 - daysSinceLastChange)
        throw new BadRequestException(`Aguarde ${daysRemaining} dias para alterar o username novamente`)
      }
    }

    const existing = await this.prisma.user.findUnique({ where: { username: newUsername } })
    if (existing) throw new BadRequestException('Username já em uso')

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        username: newUsername,
        usernameChangedAt: new Date(),
        usernameChangeCount: { increment: 1 },
      },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        avatarUrl: true,
        bio: true,
        createdAt: true,
        usernameChangeCount: true,
        usernameChangedAt: true,
      },
    })
  }
}