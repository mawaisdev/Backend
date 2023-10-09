import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from 'typeorm'

export class UserPostRelation1696846549352 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Add userId column to Posts table
    await queryRunner.addColumn(
      'Posts',
      new TableColumn({
        name: 'userId',
        type: 'int',
        isNullable: false,
      })
    )

    // 2. Create a foreign key relationship
    await queryRunner.createForeignKey(
      'Posts',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'Users',
        onDelete: 'CASCADE', // If a user is deleted, their posts will be deleted too.
      })
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Retrieve the foreign key from Posts table to drop it
    const postTable = await queryRunner.getTable('Posts')
    const userForeignKey = postTable?.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('userId') !== -1
    )
    if (userForeignKey) {
      await queryRunner.dropForeignKey('Posts', userForeignKey)
    }

    // Drop userId column from Posts table
    await queryRunner.dropColumn('Posts', 'userId')
  }
}
