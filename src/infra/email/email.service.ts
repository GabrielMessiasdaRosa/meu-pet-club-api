import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    const emailConfig = this.configService.get('EMAIL');

    this.transporter = nodemailer.createTransport({
      host: emailConfig.HOST,
      port: emailConfig.PORT,
      secure: emailConfig.PORT === 465,
      auth: {
        user: emailConfig.USER,
        pass: emailConfig.PASSWORD,
      },
    });
  }

  async sendUserCredentials(
    recipientEmail: string,
    recipientName: string,
    password: string,
  ): Promise<void> {
    const emailConfig = this.configService.get('EMAIL');

    await this.transporter.sendMail({
      from: emailConfig.FROM,
      to: recipientEmail,
      subject: 'Suas credenciais de acesso ao Meu Pet Club',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4a5568;">Bem-vindo ao Meu Pet Club!</h2>
          <p>Olá, <strong>${recipientName}</strong>!</p>
          <p>Suas credenciais de acesso à plataforma foram criadas com sucesso.</p>
          <div style="background-color: #f7fafc; border-left: 4px solid #4299e1; padding: 15px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Email:</strong> ${recipientEmail}</p>
            <p style="margin: 10px 0 0;"><strong>Senha:</strong> ${password}</p>
          </div>
          <p>Recomendamos que você altere sua senha após o primeiro acesso.</p>
          <p>Atenciosamente,<br>Equipe Meu Pet Club</p>
        </div>
      `,
    });
  }

async sendPasswordReset(
    recipientEmail: string,
    token: string,
  ): Promise<void> {
    const emailConfig = this.configService.get('EMAIL');
    const resetPasswordLink = `http://localhost:3000/recovery/set-new-password?email=${recipientEmail}&token=${token}`;

    await this.transporter.sendMail({
      from: emailConfig.FROM,
      to: recipientEmail,
      subject: 'Recuperação de Senha - Meu Pet Club',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4a5568;">Recuperação de Senha</h2>
          <p>Olá,</p>
          <p>Recebemos uma solicitação de recuperação de senha para a sua conta no Meu Pet Club.</p>
          <div style="text-align: center; margin: 25px 0;">
            <a href="${resetPasswordLink}" style="background-color: #0072bb; color: white; padding: 12px 20px; text-decoration: none; border-radius: 12px; font-weight: bold;">
              Redefinir Senha
            </a>
          </div>
          <p>Você tem 5 minutos para redefinir a sua senha. Após esse período, será necessário solicitar uma nova recuperação de senha.</p>
          <p>Se você não solicitou a recuperação de senha, ignore este e-mail.</p>
          <p>Atenciosamente,<br>Equipe Meu Pet Club</p>
        </div>
      `,
    });
  }
}
