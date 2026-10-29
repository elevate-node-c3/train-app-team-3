import { registerAs } from '@nestjs/config';

export default registerAs('notification', () => ({
  env: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.NOTIFICATION_PORT) || 50052,
  smtp: {
    host: process.env.SMTP_HOST ?? 'localhost',
    port: Number(process.env.SMTP_PORT) || 1025,
  },
  mail: {
    from: process.env.MAIL_FROM ?? 'noreply@enr.gov.eg',
  },
  rabbitmq: {
    url: process.env.RABBITMQ_URL ?? 'amqp://guest:guest@localhost:5672',
  },
}));
