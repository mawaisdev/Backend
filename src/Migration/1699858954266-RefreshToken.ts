import { MigrationInterface, QueryRunner } from "typeorm";

export class RefreshToken1699858954266 implements MigrationInterface {
    name = 'RefreshToken1699858954266'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "RefreshTokens" ("id" SERIAL NOT NULL, "ipAddress" character varying NOT NULL, "issuedAt" TIMESTAMP NOT NULL, "expiresAt" TIMESTAMP NOT NULL, "token" character varying NOT NULL, CONSTRAINT "PK_07ff4bc1b9063ed3401f15aea10" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_db56120664dd9acb3c8ae67a42" ON "RefreshTokens" ("token") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_db56120664dd9acb3c8ae67a42"`);
        await queryRunner.query(`DROP TABLE "RefreshTokens"`);
    }

}
