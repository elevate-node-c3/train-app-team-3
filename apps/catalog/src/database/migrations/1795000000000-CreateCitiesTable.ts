import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCitiesTable1795000000000 implements MigrationInterface {
  name = 'CreateCitiesTable1795000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "city" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name_ar" character varying(100) NOT NULL,
        "name_en" character varying(100) NOT NULL,
        "governorateId" uuid NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_city_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_city_governorate_name_ar" UNIQUE ("governorateId", "name_ar"),
        CONSTRAINT "UQ_city_governorate_name_en" UNIQUE ("governorateId", "name_en")
      )
    `);

    if (await queryRunner.hasTable('governorate')) {
      await queryRunner.query(`
        ALTER TABLE "city"
        ADD CONSTRAINT "FK_city_governorate"
        FOREIGN KEY ("governorateId") REFERENCES "governorate"("id")
        ON DELETE RESTRICT ON UPDATE NO ACTION
      `);
    }

    if (await queryRunner.hasTable('station')) {
      if (!(await queryRunner.hasColumn('station', 'cityId'))) {
        await queryRunner.query('ALTER TABLE "station" ADD "cityId" uuid');
      }

      if (await queryRunner.hasColumn('station', 'governorateId')) {
        await queryRunner.query(`
          INSERT INTO "city" ("name_ar", "name_en", "governorateId")
          SELECT "name_ar", "name_en", "id" FROM "governorate"
          ON CONFLICT ("governorateId", "name_en") DO NOTHING
        `);
        await queryRunner.query(`
          UPDATE "station" AS station
          SET "cityId" = city."id"
          FROM "city" AS city
          WHERE city."governorateId" = station."governorateId"
            AND station."cityId" IS NULL
        `);
        await queryRunner.query(
          'ALTER TABLE "station" ALTER COLUMN "cityId" SET NOT NULL',
        );
        await queryRunner.query(
          'ALTER TABLE "station" DROP COLUMN "governorateId"',
        );
      }

      await queryRunner.query(`
        ALTER TABLE "station"
        ADD CONSTRAINT "FK_station_city"
        FOREIGN KEY ("cityId") REFERENCES "city"("id")
        ON DELETE RESTRICT ON UPDATE NO ACTION
      `);
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('station')) {
      await queryRunner.query(
        'ALTER TABLE "station" DROP CONSTRAINT IF EXISTS "FK_station_city"',
      );
      if (await queryRunner.hasColumn('station', 'cityId')) {
        if (await queryRunner.hasTable('governorate')) {
          await queryRunner.query(
            'ALTER TABLE "station" ADD "governorateId" uuid',
          );
          await queryRunner.query(`
            UPDATE "station" AS station
            SET "governorateId" = city."governorateId"
            FROM "city" AS city
            WHERE city."id" = station."cityId"
          `);
          await queryRunner.query(
            'ALTER TABLE "station" ALTER COLUMN "governorateId" SET NOT NULL',
          );
          await queryRunner.query(`
            ALTER TABLE "station"
            ADD CONSTRAINT "FK_station_governorate"
            FOREIGN KEY ("governorateId") REFERENCES "governorate"("id")
            ON DELETE NO ACTION ON UPDATE NO ACTION
          `);
        }
        await queryRunner.query('ALTER TABLE "station" DROP COLUMN "cityId"');
      }
    }

    if (await queryRunner.hasTable('city')) {
      await queryRunner.query('DROP TABLE "city"');
    }
  }
}
