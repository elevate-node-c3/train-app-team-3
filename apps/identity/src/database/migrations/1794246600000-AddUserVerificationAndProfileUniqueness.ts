import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserVerificationAndProfileUniqueness1794246600000
  implements MigrationInterface
{
  name = "AddUserVerificationAndProfileUniqueness1794246600000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
        ADD COLUMN "isVerified" boolean NOT NULL DEFAULT false
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_users_nationalId_not_null"
      ON "users" ("nationalId")
      WHERE "nationalId" IS NOT NULL
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_users_phone_not_null"
      ON "users" ("phone")
      WHERE "phone" IS NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "UQ_users_phone_not_null"`);
    await queryRunner.query(`DROP INDEX "UQ_users_nationalId_not_null"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "isVerified"`);
  }
}
