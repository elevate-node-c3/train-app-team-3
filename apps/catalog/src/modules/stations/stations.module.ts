import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Station } from './stations.entity';
import { StationsController } from './stations.controller';
import { StationsRepository } from './stations.repository';
import { StationsService } from './stations.service';

@Module({
  imports:[
    TypeOrmModule.forFeature([Station]),
  ],
  controllers:[StationsController],
  providers:[
    StationsRepository,
    StationsService
  ]
})
export class GovernoratesModule { }