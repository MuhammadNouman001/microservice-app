import { IsEmail, IsOptional, IsString } from 'class-validator';

export class RequestCreatedNotificationDto {
  @IsOptional()
  @IsString()
  requestId?: string;

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  type: string;

  @IsString()
  urgency: string;

  @IsEmail()
  requesterEmail: string;

  @IsEmail()
  superiorEmail: string;
}
