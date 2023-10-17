import { MigrationInterface, QueryRunner } from "typeorm";

export class ModifyCategoryTable1696917996826 implements MigrationInterface {
    name = 'ModifyCategoryTable1696917996826'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Categories" DROP COLUMN "image"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Categories" ADD "image" character varying`);
    }

}
