import { MigrationInterface, QueryRunner } from "typeorm";

export class Category1699859100698 implements MigrationInterface {
    name = 'Category1699859100698'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "Categories" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" character varying, "updatedAt" TIMESTAMP DEFAULT now(), "createdAt" TIMESTAMP DEFAULT now(), "updatedById" integer, CONSTRAINT "PK_537b5c00afe7427c4fc9434cd59" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "Categories"`);
    }

}
