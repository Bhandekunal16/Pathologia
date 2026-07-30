import '../src/config/load-env';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import configuration from '../src/config/configuration';
import { User, UserSchema } from '../src/users/schemas/user.schema';
import { UserRepository } from '../src/users/repositories/user.repository';
import { Role } from '../src/shared/enums/role.enum';
import { Status } from '../src/shared/enums/status.enum';
import { hashValue } from '../src/common/utils/hash.util';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI ?? 'mongodb://localhost:27017/pathologist_friend'),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [UserRepository],
})
class SeedModule {}

async function seed() {
  const { NestFactory } = await import('@nestjs/core');
  const app = await NestFactory.createApplicationContext(SeedModule, {
    logger: ['error', 'warn', 'log'],
  });

  const userRepository = app.get(UserRepository);

  const email = process.env.ADMIN_EMAIL;
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !username || !password) {
    throw new Error('ADMIN_EMAIL, ADMIN_USERNAME, and ADMIN_PASSWORD are required');
  }

  const existingAdmin = await userRepository.findByEmail(email);
  if (existingAdmin) {
    console.log('Admin user already exists. Skipping seed.');
    await app.close();
    return;
  }

  const passwordHash = await hashValue(password);
  const admin = await userRepository.create({
    fullName: 'System Administrator',
    email: email.toLowerCase(),
    username,
    password: passwordHash,
    role: Role.ADMIN,
    status: Status.ACTIVE,
    department: 'IT',
  });

  console.log(`Admin user created: ${admin.email} (${admin._id.toString()})`);
  await app.close();
}

seed().catch((error: Error) => {
  console.error('Seed failed:', error.message);
  process.exit(1);
});
