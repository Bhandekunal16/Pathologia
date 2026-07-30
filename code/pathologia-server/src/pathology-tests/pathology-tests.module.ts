import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PathologyTestsController } from './controllers/pathology-tests.controller';
import { PathologyTestRepository } from './repositories/pathology-test.repository';
import {
  PathologyTest,
  PathologyTestSchema,
} from './schemas/pathology-test.schema';
import { PathologyTestsService } from './services/pathology-tests.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PathologyTest.name, schema: PathologyTestSchema },
    ]),
  ],
  controllers: [PathologyTestsController],
  providers: [PathologyTestsService, PathologyTestRepository],
  exports: [PathologyTestsService, PathologyTestRepository],
})
export class PathologyTestsModule {}
