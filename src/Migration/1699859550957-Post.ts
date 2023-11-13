import { MigrationInterface, QueryRunner } from "typeorm";

export class Post1699859550957 implements MigrationInterface {
    name = 'Post1699859550957'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "Posts" ("id" SERIAL NOT NULL, "title" text NOT NULL, "body" text NOT NULL, "imageUrl" text, "isDraft" boolean NOT NULL DEFAULT true, "isPrivate" boolean NOT NULL DEFAULT false, "updatedBy" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer NOT NULL, "categoryId" integer NOT NULL, CONSTRAINT "PK_0f050d6d1112b2d07545b43f945" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "Posts"`);
    }

}
