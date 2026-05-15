import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { UsersService } from '../users/users.service'
import * as bcrypt from 'bcrypt'

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(data: { username: string; email: string; password: string }) {
    const user = await this.usersService.create(data)
    const token = this.jwtService.sign({ sub: user.id, username: user.username })
    return { user, token }
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email)

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas')
    }

    const valid = await bcrypt.compare(password, user.passwordHash)

    if (!valid) {
      throw new UnauthorizedException('Credenciais inválidas')
    }

    const token = this.jwtService.sign({ sub: user.id, username: user.username })

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      token,
    }
  }
}