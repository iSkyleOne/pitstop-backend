import { Injectable } from '@nestjs/common';
import { MailDataRequired } from '@sendgrid/mail';
import { SendGridClient } from './sendgrid-client';

@Injectable()
export class EmailService {
    constructor(private readonly sendGridClient: SendGridClient) { }

    public async sendTestEmail(recipient: string, body = 'This is a test mail'): Promise<void> {
        const mail: MailDataRequired = {
            to: recipient,
            from: 'toma.toma.constantin@gmail.com', //Approved sender ID in Sendgrid
            subject: 'Test email',
            content: [{ type: 'text/plain', value: body }],
        };
        await this.sendGridClient.send(mail);
    }

    public async sendEmailWithTemplate(recipient: string, templateId: SendgridTemplate, data: { [key: string]: string }): Promise<void> {
        const mail: MailDataRequired = {
            subject: 'Test email',
            to: recipient,
            from: 'toma.toma.constantin@gmail.com',
            templateId: templateId, 
            dynamicTemplateData: {
                ...data,
            },
        };
        await this.sendGridClient.send(mail);
    }
}

export enum SendgridTemplate {
    REGISTER = 'd-54ba383c938743adb9393ece8e0eefee',
    FORGOT_PASSWORD = 'd-2a5f7c8d4e6b4e3b8f9d2f8c8e0f1e0',
}