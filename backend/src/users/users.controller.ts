import { Controller, Get, Patch, Param, Body, Request, UseGuards, Query } from '@nestjs/common'
import { UsersService } from './users.service'
import { AuthGuard } from '@nestjs/passport'

@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) { }

  @Get('search')
  search(@Query('q') q: string) {
    return this.usersService.search(q)
  }

  @Get('me')
  getMe(@Request() req) {
    return this.usersService.findById(req.user.id)
  }

  @Get(':username')
  findByUsername(@Param('username') username: string) {
    return this.usersService.findByUsername(username)
  }

  @Patch('me')
  update(@Request() req, @Body() body: { name?: string; bio?: string; avatarUrl?: string }) {
    return this.usersService.update(req.user.id, body)
  }
}