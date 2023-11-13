import { MigrationInterface, QueryRunner } from "typeorm";

export class PostCategory1699860239923 implements MigrationInterface {
    name = 'PostCategory1699860239923'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Posts" ADD CONSTRAINT "FK_4e98e49f8dc9c258753bc389386" FOREIGN KEY ("categoryId") REFERENCES "Categories"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Posts" DROP CONSTRAINT "FK_4e98e49f8dc9c258753bc389386"`);
    }

}
