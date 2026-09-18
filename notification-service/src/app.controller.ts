import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHealth() {
    return {
      service: 'notification-service',
      status: 'running',
    };
  }
}
