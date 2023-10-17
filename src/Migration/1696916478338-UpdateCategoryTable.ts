import { MigrationInterface, QueryRunner } from 'typeorm'

export class UpdateCategoryTable1696916478338 implements MigrationInterface {
  name = 'UpdateCategoryTable1696916478338'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "RefreshTokens" DROP CONSTRAINT "FK_6dfd786f75cfe054e9ae3a45f5e"`
    )
    await queryRunner.query(
      `ALTER TABLE "Comments" DROP CONSTRAINT "FK_aa80cd9ae4c341f0aeba2401b10"`
    )
    await queryRunner.query(
      `ALTER TABLE "Comments" DROP CONSTRAINT "FK_68844d71da70caf0f0f4b0ed72d"`
    )
    await queryRunner.query(
      `ALTER TABLE "Posts" DROP CONSTRAINT "FK_4e98e49f8dc9c258753bc389386"`
    )
    await queryRunner.query(
      `ALTER TABLE "Categories" DROP CONSTRAINT "FK_500f73daad9311a2302e73c16f8"`
    )
    await queryRunner.query(`DROP INDEX "public"."IDX_TOKEN"`)
    await queryRunner.query(
      `ALTER TABLE "Categories" ADD "image" character varying`
    )
    await queryRunner.query(
      `ALTER TABLE "RefreshTokens" ALTER COLUMN "userId" DROP NOT NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "Comments" ALTER COLUMN "createdAt" SET DEFAULT now()`
    )
    await queryRunner.query(
      `ALTER TABLE "Comments" ALTER COLUMN "updatedAt" SET DEFAULT now()`
    )
    await queryRunner.query(
      `ALTER TABLE "Comments" ALTER COLUMN "postId" DROP NOT NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "Posts" ALTER COLUMN "createdAt" SET DEFAULT now()`
    )
    await queryRunner.query(
      `ALTER TABLE "Posts" ALTER COLUMN "updatedAt" SET DEFAULT now()`
    )
    await queryRunner.query(
      `ALTER TABLE "Posts" ALTER COLUMN "categoryId" SET NOT NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "Categories" ALTER COLUMN "updatedAt" SET DEFAULT now()`
    )
    await queryRunner.query(
      `ALTER TABLE "Categories" ALTER COLUMN "createdAt" SET DEFAULT now()`
    )
    await queryRunner.query(
      `ALTER TABLE "Categories" ALTER COLUMN "createdById" DROP NOT NULL`
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_db56120664dd9acb3c8ae67a42" ON "RefreshTokens" ("token") `
    )
    await queryRunner.query(
      `ALTER TABLE "RefreshTokens" ADD CONSTRAINT "FK_6dfd786f75cfe054e9ae3a45f5e" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "Comments" ADD CONSTRAINT "FK_68844d71da70caf0f0f4b0ed72d" FOREIGN KEY ("postId") REFERENCES "Posts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "Comments" ADD CONSTRAINT "FK_aa80cd9ae4c341f0aeba2401b10" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "Posts" ADD CONSTRAINT "FK_4e98e49f8dc9c258753bc389386" FOREIGN KEY ("categoryId") REFERENCES "Categories"("id") ON DELETE SET NULL ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "Categories" ADD CONSTRAINT "FK_500f73daad9311a2302e73c16f8" FOREIGN KEY ("createdById") REFERENCES "Users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "Categories" DROP CONSTRAINT "FK_500f73daad9311a2302e73c16f8"`
    )
    await queryRunner.query(
      `ALTER TABLE "Posts" DROP CONSTRAINT "FK_4e98e49f8dc9c258753bc389386"`
    )
    await queryRunner.query(
      `ALTER TABLE "Comments" DROP CONSTRAINT "FK_aa80cd9ae4c341f0aeba2401b10"`
    )
    await queryRunner.query(
      `ALTER TABLE "Comments" DROP CONSTRAINT "FK_68844d71da70caf0f0f4b0ed72d"`
    )
    await queryRunner.query(
      `ALTER TABLE "RefreshTokens" DROP CONSTRAINT "FK_6dfd786f75cfe054e9ae3a45f5e"`
    )
    await queryRunner.query(
      `DROP INDEX "public"."IDX_db56120664dd9acb3c8ae67a42"`
    )
    await queryRunner.query(
      `ALTER TABLE "Categories" ALTER COLUMN "createdById" SET NOT NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "Categories" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP`
    )
    await queryRunner.query(
      `ALTER TABLE "Categories" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP`
    )
    await queryRunner.query(
      `ALTER TABLE "Posts" ALTER COLUMN "categoryId" DROP NOT NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "Posts" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP`
    )
    await queryRunner.query(
      `ALTER TABLE "Posts" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP`
    )
    await queryRunner.query(
      `ALTER TABLE "Comments" ALTER COLUMN "postId" SET NOT NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "Comments" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP`
    )
    await queryRunner.query(
      `ALTER TABLE "Comments" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP`
    )
    await queryRunner.query(
      `ALTER TABLE "RefreshTokens" ALTER COLUMN "userId" SET NOT NULL`
    )
    await queryRunner.query(`ALTER TABLE "Categories" DROP COLUMN "image"`)
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_TOKEN" ON "RefreshTokens" ("token") `
    )
    await queryRunner.query(
      `ALTER TABLE "Categories" ADD CONSTRAINT "FK_500f73daad9311a2302e73c16f8" FOREIGN KEY ("createdById") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "Posts" ADD CONSTRAINT "FK_4e98e49f8dc9c258753bc389386" FOREIGN KEY ("categoryId") REFERENCES "Categories"("id") ON DELETE SET NULL ON UPDATE CASCADE`
    )
    await queryRunner.query(
      `ALTER TABLE "Comments" ADD CONSTRAINT "FK_68844d71da70caf0f0f4b0ed72d" FOREIGN KEY ("postId") REFERENCES "Posts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "Comments" ADD CONSTRAINT "FK_aa80cd9ae4c341f0aeba2401b10" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "RefreshTokens" ADD CONSTRAINT "FK_6dfd786f75cfe054e9ae3a45f5e" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
  }
}
