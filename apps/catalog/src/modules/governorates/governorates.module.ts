import { Module } from '@nestjs/common';
import { GovernoratesRepository } from './governorates.repository';
import { GovernoratesService } from './governorates.service';
import { GovernoratesController } from './governorates.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Governorate } from './governorates.entity';

@Module({
  imports:[
    TypeOrmModule.forFeature([Governorate]),
  ],
  controllers:[GovernoratesController],
  providers:[
    GovernoratesRepository,
    GovernoratesService
  ]
})
export class GovernoratesModule { }