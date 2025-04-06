
import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { SendGridClient } from './sendgrid-client';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [EmailService, SendGridClient],
  exports: [EmailService],
})
export class EmailModule {}