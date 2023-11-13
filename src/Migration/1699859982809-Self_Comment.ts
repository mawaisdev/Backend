import { MigrationInterface, QueryRunner } from "typeorm";

export class SelfComment1699859982809 implements MigrationInterface {
    name = 'SelfComment1699859982809'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Comments" ADD "parentId" integer`);
        await queryRunner.query(`ALTER TABLE "Comments" ADD CONSTRAINT "FK_11e2470fb8467a2a49ac3de38aa" FOREIGN KEY ("parentId") REFERENCES "Comments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Comments" DROP CONSTRAINT "FK_11e2470fb8467a2a49ac3de38aa"`);
        await queryRunner.query(`ALTER TABLE "Comments" DROP COLUMN "parentId"`);
    }

}
