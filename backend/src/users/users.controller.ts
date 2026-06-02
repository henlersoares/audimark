import { Controller, Get, Patch, Param, Body, Request, UseGuards, Query, Post, UploadedFile, UseInterceptors } from '@nestjs/common'
import { UsersService } from './users.service'
import { AuthGuard } from '@nestjs/passport'
import { FileInterceptor } from '@nestjs/platform-express'
import 'multer'

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

  @Post('me/avatar')
  @UseInterceptors(FileInterceptor('file'))
  uploadAvatar(@Request() req, @UploadedFile() file: any) {
    return this.usersService.uploadAvatar(req.user.id, file)
  }

  @Patch('me/username')
  changeUsername(@Request() req, @Body() body: { username: string }) {
    return this.usersService.changeUsername(req.user.id, body.username)
  }
}