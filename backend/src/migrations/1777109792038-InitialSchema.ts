import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1777109792038 implements MigrationInterface {
  name = 'InitialSchema1777109792038';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."users_role_enum" AS ENUM('admin', 'manager', 'supplier')`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "role" "public"."users_role_enum" NOT NULL DEFAULT 'manager', "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."tasks_status_enum" AS ENUM('todo', 'in_progress', 'review', 'completed')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."tasks_priority_enum" AS ENUM('low', 'medium', 'high', 'urgent')`,
    );
    await queryRunner.query(
      `CREATE TABLE "tasks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "description" character varying, "status" "public"."tasks_status_enum" NOT NULL DEFAULT 'todo', "priority" "public"."tasks_priority_enum" NOT NULL DEFAULT 'medium', "department" character varying, "assignedToId" uuid, "createdById" uuid NOT NULL, "dueDate" date, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_8d12ff38fcc62aaba2cab748772" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."deliveries_status_enum" AS ENUM('pending', 'in_transit', 'delivered', 'delayed', 'returned')`,
    );
    await queryRunner.query(
      `CREATE TABLE "deliveries" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "trackingNumber" character varying NOT NULL, "purchaseOrderId" uuid NOT NULL, "status" "public"."deliveries_status_enum" NOT NULL DEFAULT 'pending', "estimatedArrival" date, "actualArrival" date, "carrier" character varying, "notes" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a6ef225c5c5f0974e503bfb731f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."purchase_orders_status_enum" AS ENUM('draft', 'submitted', 'approved', 'shipped', 'delivered', 'cancelled')`,
    );
    await queryRunner.query(
      `CREATE TABLE "purchase_orders" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "orderNumber" character varying NOT NULL, "supplierId" uuid NOT NULL, "items" jsonb NOT NULL DEFAULT '[]', "totalAmount" numeric(12,2) NOT NULL DEFAULT '0', "status" "public"."purchase_orders_status_enum" NOT NULL DEFAULT 'draft', "expectedDeliveryDate" date, "notes" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_0a4ef1738b13da938b62393dc04" UNIQUE ("orderNumber"), CONSTRAINT "PK_05148947415204a897e8beb2553" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."suppliers_status_enum" AS ENUM('active', 'inactive', 'suspended')`,
    );
    await queryRunner.query(
      `CREATE TABLE "suppliers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "email" character varying NOT NULL, "phone" character varying, "address" character varying, "status" "public"."suppliers_status_enum" NOT NULL DEFAULT 'active', "esgScore" numeric(3,2) NOT NULL DEFAULT '0', "certifications" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b70ac51766a9e3144f778cfe81e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "bom_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "materialName" character varying NOT NULL, "quantity" integer NOT NULL, "unit" character varying, "unitCost" numeric(10,2) NOT NULL DEFAULT '0', "productId" uuid NOT NULL, "supplierId" uuid, CONSTRAINT "PK_f88a851d4f3c46533a354229e15" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "products" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "sku" character varying NOT NULL, "description" character varying, "category" character varying, "unitPrice" numeric(10,2) NOT NULL DEFAULT '0', "currentStock" integer NOT NULL DEFAULT '0', "reorderLevel" integer NOT NULL DEFAULT '10', "unit" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."notifications_type_enum" AS ENUM('low_stock', 'delivery_delay', 'esg_non_compliance', 'task_assigned', 'order_status', 'general')`,
    );
    await queryRunner.query(
      `CREATE TABLE "notifications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "message" character varying NOT NULL, "type" "public"."notifications_type_enum" NOT NULL DEFAULT 'general', "isRead" boolean NOT NULL DEFAULT false, "userId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "forecasts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "productId" uuid NOT NULL, "forecastDate" date NOT NULL, "predictedDemand" integer NOT NULL, "actualDemand" integer, "confidence" numeric(5,2), "model" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_caa4d5aec48032eb9d2ce8535f8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "refresh_tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "tokenHash" character varying(64) NOT NULL, "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL, "revokedAt" TIMESTAMP WITH TIME ZONE, "replacedByTokenId" uuid, "userAgent" character varying(500), "ipAddress" character varying(45), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_7d8bee0204106019488c4c50ffa" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_610102b60fea1455310ccd299d" ON "refresh_tokens" ("userId") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_c25bc63d248ca90e8dcc1d92d0" ON "refresh_tokens" ("tokenHash") `,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD CONSTRAINT "FK_d020677feafe94eba0cb9d846d1" FOREIGN KEY ("assignedToId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD CONSTRAINT "FK_660898d912c6e71107e9ef8f38d" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "deliveries" ADD CONSTRAINT "FK_9f43855aefccafb168cf328884a" FOREIGN KEY ("purchaseOrderId") REFERENCES "purchase_orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "purchase_orders" ADD CONSTRAINT "FK_0c3ff892a9f2ed16f59d31cccae" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "bom_items" ADD CONSTRAINT "FK_1cc39cd1d3b9e8020a8de5dd0be" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "bom_items" ADD CONSTRAINT "FK_e34dc1acc9977ca9b381a039238" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" ADD CONSTRAINT "FK_692a909ee0fa9383e7859f9b406" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "forecasts" ADD CONSTRAINT "FK_1298a2e921e8e3c7ba4f629a9b0" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" ADD CONSTRAINT "FK_610102b60fea1455310ccd299de" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" DROP CONSTRAINT "FK_610102b60fea1455310ccd299de"`,
    );
    await queryRunner.query(
      `ALTER TABLE "forecasts" DROP CONSTRAINT "FK_1298a2e921e8e3c7ba4f629a9b0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" DROP CONSTRAINT "FK_692a909ee0fa9383e7859f9b406"`,
    );
    await queryRunner.query(
      `ALTER TABLE "bom_items" DROP CONSTRAINT "FK_e34dc1acc9977ca9b381a039238"`,
    );
    await queryRunner.query(
      `ALTER TABLE "bom_items" DROP CONSTRAINT "FK_1cc39cd1d3b9e8020a8de5dd0be"`,
    );
    await queryRunner.query(
      `ALTER TABLE "purchase_orders" DROP CONSTRAINT "FK_0c3ff892a9f2ed16f59d31cccae"`,
    );
    await queryRunner.query(
      `ALTER TABLE "deliveries" DROP CONSTRAINT "FK_9f43855aefccafb168cf328884a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" DROP CONSTRAINT "FK_660898d912c6e71107e9ef8f38d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" DROP CONSTRAINT "FK_d020677feafe94eba0cb9d846d1"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c25bc63d248ca90e8dcc1d92d0"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_610102b60fea1455310ccd299d"`,
    );
    await queryRunner.query(`DROP TABLE "refresh_tokens"`);
    await queryRunner.query(`DROP TABLE "forecasts"`);
    await queryRunner.query(`DROP TABLE "notifications"`);
    await queryRunner.query(`DROP TYPE "public"."notifications_type_enum"`);
    await queryRunner.query(`DROP TABLE "products"`);
    await queryRunner.query(`DROP TABLE "bom_items"`);
    await queryRunner.query(`DROP TABLE "suppliers"`);
    await queryRunner.query(`DROP TYPE "public"."suppliers_status_enum"`);
    await queryRunner.query(`DROP TABLE "purchase_orders"`);
    await queryRunner.query(`DROP TYPE "public"."purchase_orders_status_enum"`);
    await queryRunner.query(`DROP TABLE "deliveries"`);
    await queryRunner.query(`DROP TYPE "public"."deliveries_status_enum"`);
    await queryRunner.query(`DROP TABLE "tasks"`);
    await queryRunner.query(`DROP TYPE "public"."tasks_priority_enum"`);
    await queryRunner.query(`DROP TYPE "public"."tasks_status_enum"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
  }
}
