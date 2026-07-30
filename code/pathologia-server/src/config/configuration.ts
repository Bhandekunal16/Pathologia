export default () => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '3000', 10),
  mongodbUri:
    process.env.MONGODB_URI ?? 'mongodb://localhost:27017/pathologist_friend',
  jwt: {
    secret: process.env.JWT_SECRET ?? '',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? '',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  },
  smtp: {
    host: process.env.SMTP_HOST ?? '',
    port: parseInt(process.env.SMTP_PORT ?? '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER ?? '',
    pass: process.env.SMTP_PASS ?? '',
    from: process.env.SMTP_FROM ?? '',
  },
  admin: {
    email: process.env.ADMIN_EMAIL ?? '',
    username: process.env.ADMIN_USERNAME ?? '',
    password: process.env.ADMIN_PASSWORD ?? '',
  },
  corsOrigins: (process.env.CORS_ORIGINS?.split(',') ?? [
    'http://localhost:3000',
    'http://localhost:4200',
    'https://pathologia-client.vercel.app',
  ])
    .map((origin) => origin.trim().replace(/\/$/, ''))
    .filter(Boolean),
  frontendUrl: (
    process.env.FRONTEND_URL ??
    process.env.CORS_ORIGINS?.split(',')?.find((origin) =>
      origin.includes('pathologia-client.vercel.app'),
    ) ??
    'http://localhost:4200'
  ).replace(/\/$/, ''),
});
