import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { LoginNotificationDto } from './dto/login-notification.dto';
import { LogoutNotificationDto } from './dto/logout-notification.dto';
import { RequestCreatedNotificationDto } from './dto/request-created-notification.dto';
import { RequestStatusNotificationDto } from './dto/request-status-notification.dto';

@Injectable()
export class NotificationService {
    private readonly logger = new Logger(NotificationService.name);

    constructor(private readonly mailerService: MailerService) { }

    // 1. Send Login Email
    async sendLoginNotification(dto: LoginNotificationDto) {
        try {
            await this.mailerService.sendMail({
                to: dto.email,
                subject: '🔐 Security Alert: Successful Login',
                template: 'login',
                context: {
                    email: dto.email,
                    provider: dto.provider || 'Local Credentials',
                    timestamp: new Date().toLocaleString(),
                },
            });
            this.logger.log(`Login notification email sent to ${dto.email}`);
            return { success: true, message: 'Login email sent' };
        } catch (error) {
            const message = (error as any).message || String(error);
            this.logger.error(`Failed to send login email to ${dto.email}:`, error);
            return { success: false, error: message };
        }
    }

    // 2. Send Logout Email
    async sendLogoutNotification(dto: LogoutNotificationDto) {
        try {
            await this.mailerService.sendMail({
                to: dto.email,
                subject: '👋 Log-off Notification',
                template: 'logout',
                context: {
                    email: dto.email,
                    timestamp: new Date().toLocaleString(),
                },
            });
            this.logger.log(`Logout notification email sent to ${dto.email}`);
            return { success: true, message: 'Logout email sent' };
        } catch (error) {
            const message = (error as any).message || String(error);
            this.logger.error(`Failed to send logout email to ${dto.email}:`, error);
            return { success: false, error: message };
        }
    }

    // 3. Send Request Created Email (Sent to each recipient individually)
    async sendRequestCreatedNotification(dto: RequestCreatedNotificationDto) {
        const recipients = Array.from(new Set([dto.requesterEmail, dto.superiorEmail]));
        let sentCount = 0;

        for (const recipient of recipients) {
            try {
                await this.mailerService.sendMail({
                    to: recipient,
                    subject: `📋 New Request Created: ${dto.title}`,
                    template: 'request-created',
                    context: {
                        title: dto.title,
                        description: dto.description,
                        type: dto.type,
                        urgency: dto.urgency,
                        requesterEmail: dto.requesterEmail,
                        superiorEmail: dto.superiorEmail,
                    },
                });
                this.logger.log(`Request created email delivered to ${recipient}`);
                sentCount++;
            } catch (error) {
                const message = (error as any).message || String(error);
                this.logger.warn(`Could not deliver to ${recipient} (Resend restriction): ${message}`);
            }
        }

        return { success: sentCount > 0, delivered: sentCount };
    }

    // 4. Send Request Status Update Email (Sent to each recipient individually)
    async sendRequestStatusNotification(dto: RequestStatusNotificationDto) {
        const recipients = Array.from(new Set([dto.requesterEmail, dto.superiorEmail]));
        let sentCount = 0;

        for (const recipient of recipients) {
            try {
                await this.mailerService.sendMail({
                    to: recipient,
                    subject: `🔔 Request ${dto.status}: ${dto.title}`,
                    template: 'request-status',
                    context: {
                        title: dto.title,
                        description: dto.description || '',
                        type: dto.type || 'Leave',
                        status: dto.status,
                        requesterEmail: dto.requesterEmail,
                        superiorEmail: dto.superiorEmail,
                    },
                });
                this.logger.log(`Request status (${dto.status}) email delivered to ${recipient}`);
                sentCount++;
            } catch (error) {
                const message = (error as any).message || String(error);
                this.logger.warn(`Could not deliver to ${recipient} (Resend restriction): ${message}`);
            }
        }

        return { success: sentCount > 0, delivered: sentCount };
    }
}
