import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getRoot() {
    return {
      service: 'notification-service',
      status: 'running',
    };
  }

  @Get('health')
  getHealth() {
    return {
      service: 'notification-service',
      status: 'healthy',
    };
  }
}
