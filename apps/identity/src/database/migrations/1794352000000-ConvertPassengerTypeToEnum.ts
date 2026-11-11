import { MigrationInterface, QueryRunner } from "typeorm";

export class ConvertPassengerTypeToEnum1794352000000
  implements MigrationInterface
{
  name = "ConvertPassengerTypeToEnum1794352000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "passengers_passengerType_enum" AS ENUM ('REGULAR')
    `);
    await queryRunner.query(`
      ALTER TABLE "passengers"
      ALTER COLUMN "passengerType"
      TYPE "passengers_passengerType_enum"
      USING "passengerType"::"passengers_passengerType_enum"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "passengers"
      ALTER COLUMN "passengerType"
      TYPE character varying
      USING "passengerType"::text
    `);
    await queryRunner.query(
      `DROP TYPE "passengers_passengerType_enum"`,
    );
  }
}
