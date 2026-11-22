import { Module } from '@nestjs/common';
import { GovernoratesService } from './governorates.service';
import { GovernoratesController } from './governorates.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GovernorateOrmEntity } from './infrastructure/entities/governorates.typeorm.entity';
import { GOVERNORATE_REPOSITORY } from './domain/repositories/governorate.repository';
import { TypeOrmGovernorateRepository } from './infrastructure/repositories/governorates.typeorm.repository';

@Module({
  imports: [TypeOrmModule.forFeature([GovernorateOrmEntity])],
  controllers: [GovernoratesController],
  providers: [
    { provide: GOVERNORATE_REPOSITORY, useClass: TypeOrmGovernorateRepository },
    GovernoratesService,
  ],
  exports: [GovernoratesService],
})
export class GovernoratesModule {}