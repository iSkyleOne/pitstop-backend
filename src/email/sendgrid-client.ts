import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailDataRequired } from '@sendgrid/mail';
import * as SendGrid from '@sendgrid/mail';


@Injectable()
export class SendGridClient {
    private logger: Logger;
    constructor(
        private readonly configService: ConfigService,
    ) {
        this.logger = new Logger(SendGridClient.name);
        SendGrid.setApiKey(this.configService.getOrThrow<string>('SENDGRID_API_KEY'));
    }

    async send(mail: MailDataRequired): Promise<void> {
        try {
            await SendGrid.send(mail);
            this.logger.log(`Email successfully dispatched to ${mail.to as string}`);
        } catch (error) {
            this.logger.error('Error while sending email', error);
            throw error;
        }
    }
}