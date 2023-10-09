import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from 'typeorm'

export class UserCategoryRelation1696848899997 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Add createdById column to Categories table
    await queryRunner.addColumn(
      'Categories',
      new TableColumn({
        name: 'createdById',
        type: 'int',
        isNullable: false, // Since every category should have a creator
      })
    )

    // 2. Create a foreign key relationship
    await queryRunner.createForeignKey(
      'Categories',
      new TableForeignKey({
        columnNames: ['createdById'],
        referencedColumnNames: ['id'],
        referencedTableName: 'Users',
        onDelete: 'CASCADE', // If a user is deleted, delete associated Categories.
      })
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Retrieve the foreign key from Categories table to drop it
    const categoryTable = await queryRunner.getTable('Categories')
    const userForeignKey = categoryTable?.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('createdById') !== -1
    )
    if (userForeignKey) {
      await queryRunner.dropForeignKey('Categories', userForeignKey)
    }

    // Drop createdById column from Categories table
    await queryRunner.dropColumn('Categories', 'createdById')
  }
}
