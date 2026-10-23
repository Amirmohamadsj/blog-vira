import { type MigrationInterface, type QueryRunner } from "typeorm";

export class BlockChanges1792790774329 implements MigrationInterface {
    name = 'BlockChanges1792790774329'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "media" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`CREATE TYPE "public"."blocks_type_enum" AS ENUM('text', 'heading', 'image', 'code', 'quote')`);
        await queryRunner.query(`ALTER TABLE "blocks" ADD "type" "public"."blocks_type_enum" NOT NULL DEFAULT 'text'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "blocks" DROP COLUMN "type"`);
        await queryRunner.query(`DROP TYPE "public"."blocks_type_enum"`);
        await queryRunner.query(`ALTER TABLE "media" DROP COLUMN "updatedAt"`);
    }

}
