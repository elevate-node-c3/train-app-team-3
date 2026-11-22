import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';
import { GovernorateOrmEntity } from '../../../governorates/infrastructure/entities/governorates.typeorm.entity';
import { StationOrmEntity } from '../../../stations/infrastructure/entities/stations.typeorm.entity';

@Entity('city')
@Unique('UQ_city_governorate_name_ar', ['governorateId', 'name_ar'])
@Unique('UQ_city_governorate_name_en', ['governorateId', 'name_en'])
export class CityOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  name_ar!: string;

  @Column({ type: 'varchar', length: 100 })
  name_en!: string;

  @Column({ type: 'uuid' })
  governorateId!: string;

  @ManyToOne(() => GovernorateOrmEntity, (governorate) => governorate.cities, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'governorateId' })
  governorate!: GovernorateOrmEntity;

  @OneToMany(() => StationOrmEntity, (station) => station.city)
  stations!: StationOrmEntity[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
