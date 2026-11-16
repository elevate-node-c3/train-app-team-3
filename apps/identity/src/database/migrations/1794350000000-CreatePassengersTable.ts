import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePassengersTable1794350000000
  implements MigrationInterface
{
  name = "CreatePassengersTable1794350000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "passengers" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "fullName" character varying NOT NULL,
        "nationalId" character varying NOT NULL,
        "passengerType" character varying NOT NULL,
        "userId" uuid NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_passengers_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_passengers_userId" FOREIGN KEY ("userId")
          REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_passengers_userId" ON "passengers" ("userId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_passengers_userId"`);
    await queryRunner.query(`DROP TABLE "passengers"`);
  }
}
