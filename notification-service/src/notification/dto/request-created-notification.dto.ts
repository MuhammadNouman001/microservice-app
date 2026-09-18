import { IsEmail, IsIn, IsString } from 'class-validator';

export class RequestCreatedNotificationDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsIn(['Leave', 'Equipment', 'Overtime'])
  type: string;

  @IsIn(['Low', 'Medium', 'High'])
  urgency: string;

  @IsEmail()
  requesterEmail: string;

  @IsEmail()
  superiorEmail: string;
}
