import { Controller, Get, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private service: NotificationsService) {}

  @Get()
  findMy(@Request() req) {
    return this.service.findByUser(req.user.id);
  }

  @Get('unread-count')
  getUnreadCount(@Request() req) {
    return this.service.getUnreadCount(req.user.id);
  }

  @Patch(':id/read')
  markAsRead(@Param('id') id: string) {
    return this.service.markAsRead(id);
  }

  @Patch('read-all')
  markAllRead(@Request() req) {
    return this.service.markAllRead(req.user.id);
  }
}
