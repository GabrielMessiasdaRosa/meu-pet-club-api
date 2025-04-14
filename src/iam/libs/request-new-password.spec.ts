import * as nodemailer from 'nodemailer';
import { sendMail } from './request-new-password';

jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockImplementation(() => Promise.resolve(true)),
  }),
}));

describe('request-new-password', () => {
  const mockTransporter = {
    sendMail: jest.fn().mockImplementation(() => Promise.resolve(true)),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (nodemailer.createTransport as jest.Mock).mockReturnValue(mockTransporter);
  });

  describe('sendMail', () => {
    const email = 'usuario@teste.com';
    const token = '123456789';

    it('deve enviar um email com sucesso', async () => {
      // Mock do process.env
      process.env.NODEMAILER_EMAIL = 'suporte@meupetclub.com';

      const result = await sendMail(email, token);

      expect(nodemailer.createTransport).toHaveBeenCalledWith({
        service: 'gmail',
        auth: {
          user: '',
          pass: '',
        },
      });

      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: 'suporte@meupetclub.com',
        to: email,
        subject: 'Recuperação de Senha - Meu Pet Club',
        html: expect.stringContaining(
          `recovery/set-new-password?email=${email}&token=${token}`,
        ),
      });

      expect(result).toBe(true);
    });

    it('deve propagar o erro quando o envio de email falhar', async () => {
      const mockError = new Error('Falha no envio');
      mockTransporter.sendMail.mockRejectedValueOnce(mockError);

      await expect(sendMail(email, token)).rejects.toThrow();
    });
  });
});
