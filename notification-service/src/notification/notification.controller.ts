import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { LoginNotificationDto } from './dto/login-notification.dto';
import { LogoutNotificationDto } from './dto/logout-notification.dto';
import { RequestCreatedNotificationDto } from './dto/request-created-notification.dto';
import { RequestStatusNotificationDto } from './dto/request-status-notification.dto';

@Controller('notify')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async handleLoginNotification(@Body() dto: LoginNotificationDto) {
    return this.notificationService.sendLoginNotification(dto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async handleLogoutNotification(@Body() dto: LogoutNotificationDto) {
    return this.notificationService.sendLogoutNotification(dto);
  }

  @Post('request-created')
  @HttpCode(HttpStatus.OK)
  async handleRequestCreatedNotification(@Body() dto: RequestCreatedNotificationDto) {
    return this.notificationService.sendRequestCreatedNotification(dto);
  }

  @Post('request-status')
  @HttpCode(HttpStatus.OK)
  async handleRequestStatusNotification(@Body() dto: RequestStatusNotificationDto) {
    return this.notificationService.sendRequestStatusNotification(dto);
  }
}
