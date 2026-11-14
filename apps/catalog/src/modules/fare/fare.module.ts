import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Fare } from './fare.entity';
import { FareRepository } from './fare.repository';
import { FareController } from './fare.controller';
import { FareService } from './fare.service';

@Module({
  imports: [TypeOrmModule.forFeature([Fare])],
  controllers: [FareController],
  providers: [FareRepository, FareService],
  exports: [FareRepository, FareService],
})
export class FareModule {}