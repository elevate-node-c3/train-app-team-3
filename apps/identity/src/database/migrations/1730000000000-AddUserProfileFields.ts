import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserProfileFields1730000000000 implements MigrationInterface {
  name = "AddUserProfileFields1730000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
        ADD COLUMN "fullName" character varying,
        ADD COLUMN "nationalId" character varying,
        ADD COLUMN "phone" character varying,
        ADD COLUMN "profileType" character varying,
        ADD COLUMN "nationality" character varying,
        ADD COLUMN "isProfileCompleted" boolean NOT NULL DEFAULT false
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
        DROP COLUMN "isProfileCompleted",
        DROP COLUMN "nationality",
        DROP COLUMN "profileType",
        DROP COLUMN "phone",
        DROP COLUMN "nationalId",
        DROP COLUMN "fullName"
    `);
  }
}
