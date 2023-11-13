import { MigrationInterface, QueryRunner } from "typeorm";

export class User1699858877630 implements MigrationInterface {
    name = 'User1699858877630'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."Users_role_enum" AS ENUM('Admin', 'User')`);
        await queryRunner.query(`CREATE TABLE "Users" ("id" SERIAL NOT NULL, "firstName" character varying(20) NOT NULL, "lastName" character varying NOT NULL, "userName" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "profilePicture" character varying, "bio" character varying(300), "lastLogin" TIMESTAMP, "role" "public"."Users_role_enum" NOT NULL DEFAULT 'User', "resetPasswordCode" character varying, "isVerified" boolean NOT NULL DEFAULT false, "isDeleted" boolean NOT NULL DEFAULT false, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP, "updatedAt" TIMESTAMP, "deletedAt" TIMESTAMP, CONSTRAINT "PK_16d4f7d636df336db11d87413e3" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "Users"`);
        await queryRunner.query(`DROP TYPE "public"."Users_role_enum"`);
    }

}
