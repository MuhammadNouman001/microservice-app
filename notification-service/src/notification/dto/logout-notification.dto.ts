import { IsEmail } from 'class-validator';

export class LogoutNotificationDto {
  @IsEmail()
  email: string;
}
