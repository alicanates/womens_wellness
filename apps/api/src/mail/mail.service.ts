import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    const smtpUser = this.configService.get<string>('SMTP_USER');
    const smtpTls = this.configService.get<string>('SMTP_TLS', 'false');

    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST', 'localhost'),
      port: this.configService.get<number>('SMTP_PORT', 1025),
      secure: smtpTls === 'true',
      auth: smtpUser && smtpUser !== '__OPTIONAL__'
        ? {
            user: smtpUser,
            pass: this.configService.get<string>('SMTP_PASS'),
          }
        : undefined,
    });
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const resetUrl = `${this.configService.get<string>('API_BASE_URL')}/public/reset-password.html?token=${token}`;
    const appName = 'Women\'s Wellness Companion';

    try {
      await this.transporter.sendMail({
        from: this.configService.get<string>('SMTP_FROM', 'no-reply@local.test'),
        to: email,
        subject: 'Şifre Sıfırlama Talebi',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                  line-height: 1.6;
                  color: #333;
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 20px;
                }
                .container {
                  background: linear-gradient(135deg, #FFB6D9 0%, #FF69B4 100%);
                  border-radius: 20px;
                  padding: 40px;
                  text-align: center;
                }
                .content {
                  background: white;
                  border-radius: 16px;
                  padding: 32px;
                  margin-top: 20px;
                }
                h1 {
                  color: #FF69B4;
                  font-size: 28px;
                  margin-bottom: 10px;
                }
                .emoji {
                  font-size: 48px;
                  margin-bottom: 20px;
                }
                p {
                  color: #525252;
                  font-size: 16px;
                  margin: 16px 0;
                }
                .button {
                  display: inline-block;
                  background: #FF69B4;
                  color: white;
                  text-decoration: none;
                  padding: 14px 32px;
                  border-radius: 16px;
                  font-weight: 700;
                  font-size: 16px;
                  margin: 24px 0;
                  box-shadow: 0 4px 8px rgba(255, 105, 180, 0.3);
                }
                .button:hover {
                  background: #E91E63;
                }
                .footer {
                  margin-top: 24px;
                  padding-top: 24px;
                  border-top: 1px solid #FFD4E7;
                  color: #9CA3AF;
                  font-size: 14px;
                }
                .warning {
                  background: #FFF0F5;
                  border-left: 4px solid #FF69B4;
                  padding: 16px;
                  margin: 20px 0;
                  border-radius: 8px;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="emoji">💕</div>
                <h1>Şifre Sıfırlama</h1>
              </div>
              <div class="content">
                <p>Merhaba,</p>
                <p>Hesabınız için bir şifre sıfırlama talebi aldık. Şifrenizi sıfırlamak için aşağıdaki butona tıklayın:</p>

                <a href="${resetUrl}" class="button">Şifremi Sıfırla</a>

                <div class="warning">
                  <p style="margin: 0; font-size: 14px;">
                    ⏰ Bu bağlantı <strong>1 saat</strong> süreyle geçerlidir.
                  </p>
                </div>

                <p style="font-size: 14px;">Eğer şifre sıfırlama talebinde bulunmadıysanız, bu e-postayı görmezden gelebilirsiniz.</p>

                <p style="font-size: 12px; color: #9CA3AF; margin-top: 24px;">
                  Buton çalışmıyorsa, aşağıdaki bağlantıyı tarayıcınıza kopyalayıp yapıştırın:<br>
                  <a href="${resetUrl}" style="color: #FF69B4; word-break: break-all;">${resetUrl}</a>
                </p>

                <div class="footer">
                  <p>${appName} ile sağlıklı günler! 💪</p>
                  <p style="font-size: 12px; margin-top: 8px;">Bu otomatik bir e-postadır, lütfen yanıtlamayın.</p>
                </div>
              </div>
            </body>
          </html>
        `,
        text: `
Merhaba,

Hesabınız için bir şifre sıfırlama talebi aldık.

Şifrenizi sıfırlamak için aşağıdaki bağlantıyı kullanın:
${resetUrl}

Bu bağlantı 1 saat süreyle geçerlidir.

Eğer şifre sıfırlama talebinde bulunmadıysanız, bu e-postayı görmezden gelebilirsiniz.

${appName} ile sağlıklı günler!
        `,
      });

      this.logger.log(`Password reset email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${email}`, error);
      throw error;
    }
  }
}
