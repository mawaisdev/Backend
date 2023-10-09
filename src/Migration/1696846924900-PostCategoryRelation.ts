import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from 'typeorm'

export class PostCategoryRelation1696846924900 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Add categoryId column to Posts table
    await queryRunner.addColumn(
      'Posts',
      new TableColumn({
        name: 'categoryId',
        type: 'int',
        isNullable: true, // making it nullable in case some posts don't belong to a category
      })
    )

    // 2. Create a foreign key relationship
    await queryRunner.createForeignKey(
      'Posts',
      new TableForeignKey({
        columnNames: ['categoryId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'Categories',
        onDelete: 'SET NULL', // If a category is deleted, set categoryId in Posts to NULL.
        onUpdate: 'CASCADE', // If the referenced category ID changes, update it in Posts.
      })
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Retrieve the foreign key from Posts table to drop it
    const postTable = await queryRunner.getTable('Posts')
    const categoryForeignKey = postTable?.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('categoryId') !== -1
    )
    if (categoryForeignKey) {
      await queryRunner.dropForeignKey('Posts', categoryForeignKey)
    }

    // Drop categoryId column from Posts table
    await queryRunner.dropColumn('Posts', 'categoryId')
  }
}
