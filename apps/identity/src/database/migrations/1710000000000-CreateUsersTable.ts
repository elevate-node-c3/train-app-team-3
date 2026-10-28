import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUsersTable1710000000000 implements MigrationInterface {
    name = 'CreateUsersTable1710000000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

        await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "users_role_enum" AS ENUM('USER', 'ADMIN', 'CONDUCTOR');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

        await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" character varying NOT NULL,
        "password_hash" character varying NOT NULL,
        "full_name" character varying NOT NULL,
        "phone" character varying NOT NULL,
        "national_id" character varying NOT NULL,
        "role" "users_role_enum" NOT NULL DEFAULT 'USER',
        "is_verified" boolean NOT NULL DEFAULT false,
        "is_suspended" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_users_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "UQ_users_phone" UNIQUE ("phone"),
        CONSTRAINT "UQ_users_national_id" UNIQUE ("national_id")
      )
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "users_role_enum"`);
    }
}