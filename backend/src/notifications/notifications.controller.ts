import { Controller, Get, Patch, Param, Request, UseGuards } from '@nestjs/common'
import { NotificationsService } from './notifications.service'
import { AuthGuard } from '@nestjs/passport'

@UseGuards(AuthGuard('jwt'))
@Controller('notifications')
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  getAll(@Request() req) {
    return this.notificationsService.getAll(req.user.id)
  }

  @Get('unread')
  getUnreadCount(@Request() req) {
    return this.notificationsService.getUnreadCount(req.user.id)
  }

  @Patch('read-all')
  markAllAsRead(@Request() req) {
    return this.notificationsService.markAllAsRead(req.user.id)
  }

  @Patch(':id/read')
  markAsRead(@Param('id') id: string, @Request() req) {
    return this.notificationsService.markAsRead(id, req.user.id)
  }
}