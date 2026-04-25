import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAuditLog1777110244624 implements MigrationInterface {
  name = 'AddAuditLog1777110244624';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "audit_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "entityType" character varying(64) NOT NULL, "entityId" uuid NOT NULL, "action" character varying(16) NOT NULL, "userId" uuid, "before" jsonb, "after" jsonb, "at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_1bb179d048bbc581caa3b013439" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_13c69424c440a0e765053feb4b" ON "audit_logs" ("entityType", "entityId") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_13c69424c440a0e765053feb4b"`,
    );
    await queryRunner.query(`DROP TABLE "audit_logs"`);
  }
}
