import { Entity, PrimaryGeneratedColumn, OneToMany , Column, UpdateDateColumn , CreateDateColumn  } from 'typeorm';
import { CityOrmEntity } from '../../../cities/infrastructure/entities/city.typeorm.entity';


@Entity('governorate')
export class GovernorateOrmEntity{

  @PrimaryGeneratedColumn('uuid')
  id!:string


  @Column({type:'varchar' , length:100 , unique:true})
  name_ar!:string

  @Column({type:'varchar' , length:100 , unique:true})
  name_en!:string


  @OneToMany(() => CityOrmEntity, (city) => city.governorate)
  cities!: CityOrmEntity[];


  @CreateDateColumn()
  createdAt!:Date


  @UpdateDateColumn()
  updatedAt!:Date


}



