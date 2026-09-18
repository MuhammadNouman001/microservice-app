import { IsEmail, IsOptional, IsString } from 'class-validator';

export class LoginNotificationDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  provider?: string;
}
