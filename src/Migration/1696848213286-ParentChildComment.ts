import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from 'typeorm'

export class ParentChildComment1696848213286 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Add parentId column to Comments table
    await queryRunner.addColumn(
      'Comments',
      new TableColumn({
        name: 'parentId',
        type: 'int',
        isNullable: true, // Some comments won't have a parent, they are top-level comments.
      })
    )

    // 2. Create a foreign key relationship
    await queryRunner.createForeignKey(
      'Comments',
      new TableForeignKey({
        columnNames: ['parentId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'Comments',
        onDelete: 'CASCADE', // If a parent comment is deleted, delete all its child comments.
      })
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Retrieve the foreign key from Comments table to drop it
    const commentTable = await queryRunner.getTable('Comments')
    const parentForeignKey = commentTable?.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('parentId') !== -1
    )
    if (parentForeignKey) {
      await queryRunner.dropForeignKey('Comments', parentForeignKey)
    }

    // Drop parentId column from Comments table
    await queryRunner.dropColumn('Comments', 'parentId')
  }
}
