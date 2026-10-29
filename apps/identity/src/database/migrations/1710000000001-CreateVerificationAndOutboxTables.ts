import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateVerificationAndOutboxTables1710000000001 implements MigrationInterface {
    name = 'CreateVerificationAndOutboxTables1710000000001';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "verification_codes" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "user_id" uuid NOT NULL,
                "email" character varying NOT NULL,
                "code_hash" character varying NOT NULL,
                "purpose" character varying NOT NULL DEFAULT 'email-verification',
                "attempts" integer NOT NULL DEFAULT 0,
                "max_attempts" integer NOT NULL DEFAULT 5,
                "expires_at" TIMESTAMP NOT NULL,
                "used_at" TIMESTAMP NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_verification_codes_id" PRIMARY KEY ("id"),
                CONSTRAINT "FK_verification_codes_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
            );
            CREATE INDEX "IDX_verification_codes_email" ON "verification_codes" ("email");
            CREATE INDEX "IDX_verification_codes_user_id" ON "verification_codes" ("user_id");
        `);

        await queryRunner.query(`
            CREATE TABLE "outbox_events" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "event_id" uuid NOT NULL,
                "event_type" character varying NOT NULL,
                "aggregate_type" character varying NOT NULL,
                "aggregate_id" character varying NOT NULL,
                "payload" jsonb NOT NULL,
                "correlation_id" character varying NULL,
                "status" character varying NOT NULL DEFAULT 'PENDING',
                "retry_count" integer NOT NULL DEFAULT 0,
                "sent_at" TIMESTAMP NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_outbox_events_id" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_outbox_events_event_id" UNIQUE ("event_id")
            );
            CREATE INDEX "IDX_outbox_events_status" ON "outbox_events" ("status");
        `);

        await queryRunner.query(`
            CREATE TABLE "sessions" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "user_id" uuid NOT NULL,
                "refresh_token_hash" character varying NOT NULL,
                "expires_at" TIMESTAMP NOT NULL,
                "revoked_at" TIMESTAMP NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_sessions_id" PRIMARY KEY ("id"),
                CONSTRAINT "FK_sessions_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
            );
            CREATE INDEX "IDX_sessions_user_id" ON "sessions" ("user_id");
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "sessions"`);
        await queryRunner.query(`DROP TABLE "outbox_events"`);
        await queryRunner.query(`DROP TABLE "verification_codes"`);
    }
}
