import { IsEmail, IsIn, IsOptional, IsString } from 'class-validator';

export class RequestStatusNotificationDto {
  @IsOptional()
  @IsString()
  requestId?: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsIn(['APPROVED', 'REJECTED', 'Approved', 'Rejected'])
  status: string;

  @IsEmail()
  requesterEmail: string;

  @IsEmail()
  superiorEmail: string;

  @IsOptional()
  @IsString()
  comment?: string;
}
