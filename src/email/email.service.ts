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
        console.log('Sending email with template', mail, templateId);
        await this.sendGridClient.send(mail);
    }
}

export enum SendgridTemplate {
    REGISTER = 'd-54ba383c938743adb9393ece8e0eefee',
    RESET_PASSWORD = 'd-23472010bc3145c2aba5bb0880f413af',
}