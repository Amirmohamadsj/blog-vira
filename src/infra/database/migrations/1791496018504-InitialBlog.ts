import { type MigrationInterface, type QueryRunner } from "typeorm";

export class InitialBlog1791496018504 implements MigrationInterface {
    name = 'InitialBlog1791496018504'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('user', 'admin')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "username" character varying(50) NOT NULL, "email" character varying(255) NOT NULL, "password" character varying(255) NOT NULL, "role" "public"."users_role_enum" NOT NULL DEFAULT 'user', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "avatar_media_id" integer, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "REL_d9c628b3f5b6ae73eb41c2045e" UNIQUE ("avatar_media_id"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."posts_status_enum" AS ENUM('draft', 'published')`);
        await queryRunner.query(`CREATE TABLE "posts" ("id" SERIAL NOT NULL, "title" character varying(200) NOT NULL, "slug" character varying(255) NOT NULL, "content" text NOT NULL, "excerpt" text NOT NULL, "status" "public"."posts_status_enum" NOT NULL DEFAULT 'draft', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "author_id" integer, "category_id" integer, "cover_media_id" integer, CONSTRAINT "UQ_54ddf9075260407dcfdd7248577" UNIQUE ("slug"), CONSTRAINT "REL_6a09bbe5393c8a0570de5487f6" UNIQUE ("cover_media_id"), CONSTRAINT "PK_2829ac61eff60fcec60d7274b9e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_posts_author_id" ON "posts"  ("author_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_posts_category_id" ON "posts"  ("category_id") `);
        await queryRunner.query(`CREATE TABLE "categories" ("id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, "slug" character varying(100) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_8b0be371d28245da6e4f4b61878" UNIQUE ("name"), CONSTRAINT "UQ_420d9f679d41281f282f5bc7d09" UNIQUE ("slug"), CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "tags" ("id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, "slug" character varying(100) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_d90243459a697eadb8ad56e9092" UNIQUE ("name"), CONSTRAINT "UQ_b3aa10c29ea4e61a830362bd25a" UNIQUE ("slug"), CONSTRAINT "PK_e7dc17249a1148a1970748eda99" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "comments" ("id" SERIAL NOT NULL, "content" text NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "user_id" integer, "post_id" integer, CONSTRAINT "PK_8bf68bc960f2b69e818bdb90dcb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_comments_user_id" ON "comments"  ("user_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_comments_post_id" ON "comments"  ("post_id") `);
        await queryRunner.query(`CREATE TABLE "media" ("id" SERIAL NOT NULL, "filename" character varying(255) NOT NULL, "originalName" character varying(255) NOT NULL, "mimeType" character varying(100) NOT NULL, "size" integer NOT NULL, "path" character varying(500) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_f4e0fcac36e050de337b670d8bd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "views" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "post_id" integer, CONSTRAINT "PK_ae7537f375649a618fff0fb2cb6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_views_post_id" ON "views"  ("post_id") `);
        await queryRunner.query(`CREATE TABLE "blocks" ("id" SERIAL NOT NULL, "post_id" integer NOT NULL, "content" text NOT NULL, "position" integer NOT NULL, "lastEdit" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_8244fa1495c4e9222a01059244b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_blocks_post_position" ON "blocks"  ("post_id", "position") `);
        await queryRunner.query(`CREATE INDEX "IDX_blocks_post_id" ON "blocks"  ("post_id") `);
        await queryRunner.query(`CREATE TABLE "post_tags" ("post_id" integer NOT NULL, "tag_id" integer NOT NULL, CONSTRAINT "PK_deee54a40024b7afc16d25684f8" PRIMARY KEY ("post_id", "tag_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_5df4e8dc2cb3e668b962362265" ON "post_tags"  ("post_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_192ab488d1c284ac9abe2e3035" ON "post_tags"  ("tag_id") `);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_d9c628b3f5b6ae73eb41c2045eb" FOREIGN KEY ("avatar_media_id") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "posts" ADD CONSTRAINT "FK_312c63be865c81b922e39c2475e" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "posts" ADD CONSTRAINT "FK_852f266adc5d67c40405c887b49" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "posts" ADD CONSTRAINT "FK_6a09bbe5393c8a0570de5487f66" FOREIGN KEY ("cover_media_id") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comments" ADD CONSTRAINT "FK_4c675567d2a58f0b07cef09c13d" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comments" ADD CONSTRAINT "FK_259bf9825d9d198608d1b46b0b5" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "views" ADD CONSTRAINT "FK_5aaf47e677b0795ac1ff93b7793" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "blocks" ADD CONSTRAINT "FK_6caa4dbddfd7537fec75c72d95d" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "post_tags" ADD CONSTRAINT "FK_5df4e8dc2cb3e668b962362265d" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "post_tags" ADD CONSTRAINT "FK_192ab488d1c284ac9abe2e30356" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post_tags" DROP CONSTRAINT "FK_192ab488d1c284ac9abe2e30356"`);
        await queryRunner.query(`ALTER TABLE "post_tags" DROP CONSTRAINT "FK_5df4e8dc2cb3e668b962362265d"`);
        await queryRunner.query(`ALTER TABLE "blocks" DROP CONSTRAINT "FK_6caa4dbddfd7537fec75c72d95d"`);
        await queryRunner.query(`ALTER TABLE "views" DROP CONSTRAINT "FK_5aaf47e677b0795ac1ff93b7793"`);
        await queryRunner.query(`ALTER TABLE "comments" DROP CONSTRAINT "FK_259bf9825d9d198608d1b46b0b5"`);
        await queryRunner.query(`ALTER TABLE "comments" DROP CONSTRAINT "FK_4c675567d2a58f0b07cef09c13d"`);
        await queryRunner.query(`ALTER TABLE "posts" DROP CONSTRAINT "FK_6a09bbe5393c8a0570de5487f66"`);
        await queryRunner.query(`ALTER TABLE "posts" DROP CONSTRAINT "FK_852f266adc5d67c40405c887b49"`);
        await queryRunner.query(`ALTER TABLE "posts" DROP CONSTRAINT "FK_312c63be865c81b922e39c2475e"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_d9c628b3f5b6ae73eb41c2045eb"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_192ab488d1c284ac9abe2e3035"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5df4e8dc2cb3e668b962362265"`);
        await queryRunner.query(`DROP TABLE "post_tags"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_blocks_post_id"`);
        await queryRunner.query(`DROP INDEX "public"."UQ_blocks_post_position"`);
        await queryRunner.query(`DROP TABLE "blocks"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_views_post_id"`);
        await queryRunner.query(`DROP TABLE "views"`);
        await queryRunner.query(`DROP TABLE "media"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_comments_post_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_comments_user_id"`);
        await queryRunner.query(`DROP TABLE "comments"`);
        await queryRunner.query(`DROP TABLE "tags"`);
        await queryRunner.query(`DROP TABLE "categories"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_posts_category_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_posts_author_id"`);
        await queryRunner.query(`DROP TABLE "posts"`);
        await queryRunner.query(`DROP TYPE "public"."posts_status_enum"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    }

}
