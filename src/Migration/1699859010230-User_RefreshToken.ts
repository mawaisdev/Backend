import { MigrationInterface, QueryRunner } from "typeorm";

export class UserRefreshToken1699859010230 implements MigrationInterface {
    name = 'UserRefreshToken1699859010230'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "RefreshTokens" ADD "userId" integer`);
        await queryRunner.query(`ALTER TABLE "RefreshTokens" ADD CONSTRAINT "FK_6dfd786f75cfe054e9ae3a45f5e" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "RefreshTokens" DROP CONSTRAINT "FK_6dfd786f75cfe054e9ae3a45f5e"`);
        await queryRunner.query(`ALTER TABLE "RefreshTokens" DROP COLUMN "userId"`);
    }

}
