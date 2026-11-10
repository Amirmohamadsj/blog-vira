import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMediaIdToBlocks1793144089988 implements MigrationInterface {
    name = 'AddMediaIdToBlocks1793144089988'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "blocks" ADD "media_id" integer`);
        await queryRunner.query(`ALTER TABLE "blocks" ADD CONSTRAINT "FK_2b42b9f0f277264d576f9c23c35" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "blocks" DROP CONSTRAINT "FK_2b42b9f0f277264d576f9c23c35"`);
        await queryRunner.query(`ALTER TABLE "blocks" DROP COLUMN "media_id"`);
    }

}
