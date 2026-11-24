import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMediaOwner1795464657094 implements MigrationInterface {
    name = 'AddMediaOwner1795464657094'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_blocks_post_id"`);
        await queryRunner.query(`ALTER TABLE "blocks" DROP COLUMN "lastEdit"`);
        await queryRunner.query(`ALTER TABLE "media" ADD "owner_id" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "blocks" ADD CONSTRAINT "CHK_f877930d1622df0b59695fb0ea" CHECK ("position" >= 0)`);
        await queryRunner.query(`ALTER TABLE "media" ADD CONSTRAINT "FK_c6889397830b5ed0f2a30362065" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "media" DROP CONSTRAINT "FK_c6889397830b5ed0f2a30362065"`);
        await queryRunner.query(`ALTER TABLE "blocks" DROP CONSTRAINT "CHK_f877930d1622df0b59695fb0ea"`);
        await queryRunner.query(`ALTER TABLE "media" DROP COLUMN "owner_id"`);
        await queryRunner.query(`ALTER TABLE "blocks" ADD "lastEdit" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`CREATE INDEX "IDX_blocks_post_id" ON "blocks" USING btree ("post_id") `);
    }

}
