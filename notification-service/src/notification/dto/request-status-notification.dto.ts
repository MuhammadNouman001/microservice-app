import { IsEmail, IsIn, IsString } from 'class-validator';

export class RequestStatusNotificationDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsIn(['Leave', 'Equipment', 'Overtime'])
  type: string;

  @IsIn(['APPROVED', 'REJECTED'])
  status: string;

  @IsEmail()
  requesterEmail: string;

  @IsEmail()
  superiorEmail: string;
}
