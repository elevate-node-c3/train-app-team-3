import { MigrationInterface } from 'typeorm';
import { CreateCitiesTable1795000000000 } from './1795000000000-CreateCitiesTable';

export const migrations: Array<new () => MigrationInterface> = [
  CreateCitiesTable1795000000000,
];