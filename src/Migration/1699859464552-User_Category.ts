import { MigrationInterface, QueryRunner } from "typeorm";

export class UserCategory1699859464552 implements MigrationInterface {
    name = 'UserCategory1699859464552'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Categories" ADD "createdById" integer`);
        await queryRunner.query(`ALTER TABLE "Categories" ADD CONSTRAINT "FK_500f73daad9311a2302e73c16f8" FOREIGN KEY ("createdById") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Categories" DROP CONSTRAINT "FK_500f73daad9311a2302e73c16f8"`);
        await queryRunner.query(`ALTER TABLE "Categories" DROP COLUMN "createdById"`);
    }

}
