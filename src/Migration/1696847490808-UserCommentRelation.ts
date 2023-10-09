import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from 'typeorm'

export class UserCommentRelation1696847490808 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Add userId column to Comments table
    await queryRunner.addColumn(
      'Comments',
      new TableColumn({
        name: 'userId',
        type: 'int',
        isNullable: true, // Making it nullable to ensure existing comments don't break
      })
    )

    // 2. Create a foreign key relationship
    await queryRunner.createForeignKey(
      'Comments',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'Users',
        onDelete: 'CASCADE', // If a user is deleted, delete all their comments.
      })
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Retrieve the foreign key from Comments table to drop it
    const commentTable = await queryRunner.getTable('Comments')
    const userForeignKey = commentTable?.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('userId') !== -1
    )
    if (userForeignKey) {
      await queryRunner.dropForeignKey('Comments', userForeignKey)
    }

    // Drop userId column from Comments table
    await queryRunner.dropColumn('Comments', 'userId')
  }
}
