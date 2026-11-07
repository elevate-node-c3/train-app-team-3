import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserLanguage1794086400000 implements MigrationInterface {
  name = "AddUserLanguage1794086400000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "lang" character varying NOT NULL DEFAULT 'ar'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "lang"`);
  }
}
