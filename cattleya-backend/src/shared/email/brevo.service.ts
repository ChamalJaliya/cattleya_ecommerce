import { Injectable, Logger } from '@nestjs/common';
import * as Brevo from '@getbrevo/brevo';

@Injectable()
export class BrevoService {
  private readonly logger = new Logger(BrevoService.name);
  private readonly apiInstance: any;
  private readonly fromEmail: string;

  constructor() {
    this.fromEmail = process.env.BREVO_FROM_EMAIL || '';
    this.apiInstance = new Brevo.TransactionalEmailsApi();
    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey || !this.fromEmail) {
      this.logger.warn('Brevo API key or from email not set. Emails will not be sent.');
    } else {
      this.apiInstance.authentications['api-key'].apiKey = apiKey;
    }
  }

  async sendEmail(to: string, subject: string, htmlContent: string, textContent?: string) {
    if (!process.env.BREVO_API_KEY || !this.fromEmail) {
      this.logger.warn('Brevo API key or from email not set. Skipping email send.');
      return;
    }
    const sendSmtpEmail = {
      to: [{ email: to }],
      sender: { email: this.fromEmail, name: 'Cattleya Orchids' },
      subject,
      htmlContent,
      textContent,
    };
    try {
      await this.apiInstance.sendTransacEmail(sendSmtpEmail);
      this.logger.log(`Email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}: ${error.message}`);
    }
  }
} 