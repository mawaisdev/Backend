import { MigrationInterface, QueryRunner } from 'typeorm'

export class UpdatePostCommentsCascade1699358029060
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Use double quotes to quote identifiers, not backticks
    await queryRunner.query(
      'ALTER TABLE "Comments" ADD CONSTRAINT "FK_comment_post" FOREIGN KEY ("postId") REFERENCES "Posts"("id") ON DELETE CASCADE'
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
