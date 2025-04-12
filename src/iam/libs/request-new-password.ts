import * as nodemailer from 'nodemailer';

export async function sendMail(
  destination: string,
  token: string,
): Promise<boolean> {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: ``,
      pass: ``,
    },
  });

  const resetPasswordLink = `http://localhost:3000/recovery/set-new-password?email=${destination}&token=${token}`;

  const html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Recuperação de Senha - Magic Flea Market</title>
      <style>
          body {
              font-family: Arial, sans-serif;
              background-color: #f2f2f2;
              margin: 0;
              padding: 0;
          }

          .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #fff;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
              border-radius: 5px;
              text-align: center; 
          }

          a {
            color: #fff !important;
            text-decoration: none !important;
          }

          h1 {
              color: #0072bb;
          }

          p {
              color: #333;
          }

          .button {
              transition: all 0.2s ease-in-out;
              display: inline-block;
              background-color: #0072bb;
              color: #fff;
              padding: 10px 20px;
              margin-top: 20px;
              text-decoration: none;
              border-radius: 12px;
          }

          .button:hover {
              background-color: #0055a4;
          }

          footer {
              margin-top: 20px;
              color: #777;
          }
      </style>
  </head>
  <body>
  <span style="opacity: 0">${new Date()}</span>
      <div class="container">
      <a href="https://imgbb.com/"><img src="https://i.ibb.co/XLrTB77/Captura-de-tela-de-2024-03-02-16-06-53.png" alt="Captura-de-tela-de-2024-03-02-16-06-53" border="0"></a>
          <h1>Recuperação de Senha</h1>
          <p>Olá,</p>
          <p>Recebemos uma solicitação de recuperação de senha para a sua conta no Meu Pet Club. Clique no botão abaixo para redefinir a sua senha:</p>
          <a href="${resetPasswordLink}" class="button">Redefinir Senha</a>
          <p>Você tem 5 minutos para redefinir a sua senha. Após esse período, será necessário solicitar uma nova recuperação de senha.</p>
          <footer>
              <p>Se você não solicitou a recuperação de senha, ignore este e-mail. Ele é enviado automaticamente.</p>
              <p>Meu Pet Club &copy; 2025</p>
              <span >${new Date()}</span>
          </footer>
      </div>
      
  </body>
  </html>
  `;

  const mailOptions = {
    from: process.env.NODEMAILER_EMAIL,
    to: destination,
    subject: 'Recuperação de Senha - Meu Pet Club',
    html: html,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error: any) {
    throw new Error(error);
  }
}
