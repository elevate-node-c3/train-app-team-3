import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPassengerOwnerListIndex1794351000000
  implements MigrationInterface
{
  name = "AddPassengerOwnerListIndex1794351000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "IDX_passengers_userId_createdAt" ON "passengers" ("userId", "createdAt")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "IDX_passengers_userId_createdAt"`,
    );
  }
}
