import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { EjsAdapter } from '@nestjs-modules/mailer/adapters/ejs.adapter';
import { join } from 'path';
import { AppController } from './app.controller';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('SMTP_HOST', 'smtp.resend.com'),
          port: configService.get<number>('SMTP_PORT', 465),
          secure: configService.get<string>('SMTP_SECURE', 'true') === 'true',
          auth: {
            user: configService.get<string>('SMTP_USER', 'resend'),
            pass: configService.get<string>('SMTP_PASS'),
          },
        },
        defaults: {
          from: configService.get<string>(
            'SMTP_FROM',
            '"Microservices System" <onboarding@resend.dev>',
          ),
        },
        template: {
          dir: join(process.cwd(), 'src/notification/templates'),
          adapter: new EjsAdapter(),
          options: {
            strict: false,
          },
        },
      }),
    }),
    NotificationModule,
  ],
  controllers: [AppController], // <-- Added AppController here!
})
export class AppModule { }
