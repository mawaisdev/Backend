import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from 'typeorm'

export class PostCommentRelation1696848083265 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Add postId column to Comments table
    await queryRunner.addColumn(
      'Comments',
      new TableColumn({
        name: 'postId',
        type: 'int',
        isNullable: false, // Every comment should be associated with a post
      })
    )

    // 2. Create a foreign key relationship
    await queryRunner.createForeignKey(
      'Comments',
      new TableForeignKey({
        columnNames: ['postId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'Posts',
        onDelete: 'CASCADE', // If a post is deleted, delete all its associated comments.
      })
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Retrieve the foreign key from Comments table to drop it
    const commentTable = await queryRunner.getTable('Comments')
    const postForeignKey = commentTable?.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('postId') !== -1
    )
    if (postForeignKey) {
      await queryRunner.dropForeignKey('Comments', postForeignKey)
    }

    // Drop postId column from Comments table
    await queryRunner.dropColumn('Comments', 'postId')
  }
}
