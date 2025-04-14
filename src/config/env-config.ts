export default () => ({
  MONGO_URI: process.env.MONGO_URI,
  EMAIL: {
    HOST: process.env.EMAIL_HOST || 'smtp.gmail.com',
    PORT: parseInt(process.env.EMAIL_PORT || '587', 10),
    USER: process.env.EMAIL_USER || 'seu-email@gmail.com',
    PASSWORD: process.env.EMAIL_PASSWORD || 'sua-senha-de-app',
    FROM: process.env.EMAIL_FROM || 'Meu Pet Club <no-reply@meupetclub.com>',
  },
});
