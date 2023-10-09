import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from 'typeorm'

export class UserRefreshTokenRelation1696836786172
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Add userId column to RefreshTokens table
    await queryRunner.addColumn(
      'RefreshTokens',
      new TableColumn({
        name: 'userId',
        type: 'int',
        isNullable: false,
      })
    )

    // 2. Add foreign key constraint
    await queryRunner.createForeignKey(
      'RefreshTokens',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'Users',
        onDelete: 'CASCADE', // or "SET NULL", depending on your requirements
      })
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Get the table first
    const table = await queryRunner.getTable('RefreshTokens')

    // Find the foreign key
    const foreignKey = table?.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('userId') !== -1
    )

    // If foreign key exists, drop it
    if (foreignKey) {
      await queryRunner.dropForeignKey('RefreshTokens', foreignKey)
    }

    // Then drop the column
    await queryRunner.dropColumn('RefreshTokens', 'userId')
  }
}
