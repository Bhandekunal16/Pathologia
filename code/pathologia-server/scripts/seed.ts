import '../src/config/load-env';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import configuration from '../src/config/configuration';
import { User, UserSchema } from '../src/users/schemas/user.schema';
import { UserRepository } from '../src/users/repositories/user.repository';
import {
  PathologyTest,
  PathologyTestSchema,
} from '../src/pathology-tests/schemas/pathology-test.schema';
import { PathologyTestRepository } from '../src/pathology-tests/repositories/pathology-test.repository';
import { Role } from '../src/shared/enums/role.enum';
import { Status } from '../src/shared/enums/status.enum';
import { TestCategory } from '../src/shared/enums/test-category.enum';
import { hashValue } from '../src/common/utils/hash.util';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI ?? 'mongodb://localhost:27017/pathologist_friend'),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: PathologyTest.name, schema: PathologyTestSchema },
    ]),
  ],
  providers: [UserRepository, PathologyTestRepository],
})
class SeedModule {}

const SAMPLE_TESTS = [
  {
    name: 'Complete Blood Count (CBC)',
    code: 'CBC-001',
    category: TestCategory.BLOOD,
    specimenType: 'Venous Blood',
    description: 'Measures red cells, white cells, hemoglobin, and platelets.',
    rate: 350,
    manual:
      'Patient should fast for 8-12 hours if combined with lipid panel. Collect 3-5 mL venous blood in EDTA (lavender-top) tube. Mix gently by inverting 8-10 times. Process within 24 hours. Avoid hemolysis during collection.',
  },
  {
    name: 'Lipid Profile',
    code: 'LIPID-001',
    category: TestCategory.BLOOD,
    specimenType: 'Venous Blood',
    description: 'Measures total cholesterol, LDL, HDL, and triglycerides.',
    rate: 650,
    manual:
      'Patient must fast for 9-12 hours (water allowed). Collect 5 mL venous blood in serum separator tube (gold/red). Allow to clot for 30 minutes, then centrifuge. Separate serum within 2 hours.',
  },
  {
    name: 'Liver Function Test (LFT)',
    code: 'LFT-001',
    category: TestCategory.BLOOD,
    specimenType: 'Venous Blood',
    description: 'Assesses liver enzymes, bilirubin, and protein levels.',
    rate: 750,
    manual:
      'No fasting required unless ordered with lipid panel. Collect 5 mL venous blood in serum separator tube. Avoid hemolysis. Label with time of collection if patient is on hepatotoxic medications.',
  },
  {
    name: 'Urinalysis (Routine)',
    code: 'UA-001',
    category: TestCategory.URINE,
    specimenType: 'Midstream Urine',
    description: 'Screens for urinary tract infection, kidney disease, and diabetes.',
    rate: 200,
    manual:
      'Collect clean-catch midstream urine in sterile container. First morning sample preferred. Deliver to lab within 2 hours or refrigerate at 2-8°C for up to 24 hours. Minimum volume: 10 mL.',
  },
  {
    name: 'Urine Culture & Sensitivity',
    code: 'UC-001',
    category: TestCategory.URINE,
    specimenType: 'Midstream Urine',
    description: 'Identifies bacterial infection and antibiotic sensitivity.',
    rate: 500,
    manual:
      'Use sterile collection kit. Clean genital area before collection. Collect midstream urine without touching container rim. Process within 30 minutes or refrigerate immediately. Note if patient is on antibiotics.',
  },
  {
    name: 'Chest X-Ray (PA View)',
    code: 'CXR-001',
    category: TestCategory.IMAGING,
    specimenType: 'Radiographic Image',
    description: 'Evaluates lungs, heart, and chest wall structures.',
    rate: 450,
    manual:
      'Remove metal objects from chest area. Patient stands facing detector with hands on hips, shoulders rolled forward. Take deep breath and hold during exposure. Document pregnancy status before imaging.',
  },
  {
    name: 'Abdominal Ultrasound',
    code: 'USG-ABD-001',
    category: TestCategory.IMAGING,
    specimenType: 'Ultrasound Image',
    description: 'Visualizes liver, gallbladder, kidneys, spleen, and pancreas.',
    rate: 1200,
    manual:
      'Patient must fast for 6-8 hours before exam. Drink 1 liter of water 1 hour before scan and do not empty bladder. Wear loose clothing. Bring previous imaging reports if available.',
  },
  {
    name: 'Annual Body Checkup Panel',
    code: 'BCP-001',
    category: TestCategory.BODY_CHECKUP,
    specimenType: 'Blood & Urine',
    description: 'Comprehensive screening including CBC, LFT, kidney function, and urinalysis.',
    rate: 2500,
    manual:
      'Patient should fast for 10-12 hours. Collect blood samples first (EDTA and serum tubes), then midstream urine. Schedule morning appointment. Patient should avoid strenuous exercise 24 hours before collection.',
  },
  {
    name: 'Thyroid Profile (TSH, T3, T4)',
    code: 'THY-001',
    category: TestCategory.BLOOD,
    specimenType: 'Venous Blood',
    description: 'Evaluates thyroid gland function.',
    rate: 550,
    manual:
      'No fasting required. Collect 3-5 mL venous blood in serum separator tube. Note time of last thyroid medication dose if patient is on levothyroxine. Separate serum within 2 hours.',
  },
  {
    name: 'ECG (12-Lead Electrocardiogram)',
    code: 'ECG-001',
    category: TestCategory.BODY_CHECKUP,
    specimenType: 'Cardiac Recording',
    description: 'Records electrical activity of the heart.',
    rate: 300,
    manual:
      'Patient should rest for 5 minutes before test. Expose chest, wrists, and ankles. Remove lotions/oils from skin. Place electrodes per standard 12-lead protocol. Patient should lie still and breathe normally during recording.',
  },
];

async function seed() {
  const { NestFactory } = await import('@nestjs/core');
  const app = await NestFactory.createApplicationContext(SeedModule, {
    logger: ['error', 'warn', 'log'],
  });

  const userRepository = app.get(UserRepository);
  const pathologyTestRepository = app.get(PathologyTestRepository);

  const email = process.env.ADMIN_EMAIL;
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !username || !password) {
    throw new Error('ADMIN_EMAIL, ADMIN_USERNAME, and ADMIN_PASSWORD are required');
  }

  const existingAdmin = await userRepository.findByEmail(email);
  if (!existingAdmin) {
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
  } else {
    console.log('Admin user already exists. Skipping admin seed.');
  }

  let testsCreated = 0;
  for (const test of SAMPLE_TESTS) {
    const existing = await pathologyTestRepository.findByCode(test.code);
    if (!existing) {
      await pathologyTestRepository.create(test);
      testsCreated += 1;
    }
  }

  if (testsCreated > 0) {
    console.log(`Created ${testsCreated} pathology test(s).`);
  } else {
    console.log('Pathology tests already seeded. Skipping test seed.');
  }

  await app.close();
}

seed().catch((error: Error) => {
  console.error('Seed failed:', error.message);
  process.exit(1);
});
