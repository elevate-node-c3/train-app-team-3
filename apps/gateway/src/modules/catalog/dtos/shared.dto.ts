import { IsUUID } from 'class-validator';

export class EmptyRequestDto {}

export class IdRequestDto {
  @IsUUID()
  id!: string;
}
