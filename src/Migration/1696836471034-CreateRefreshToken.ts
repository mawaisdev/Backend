import { MigrationInterface, QueryRunner, Table } from 'typeorm'

export class CreateRefreshToken1696836471034 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'RefreshTokens',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'ipAddress',
            type: 'varchar',
          },
          {
            name: 'issuedAt',
            type: 'timestamp',
          },
          {
            name: 'expiresAt',
            type: 'timestamp',
          },
          {
            name: 'token',
            type: 'varchar',
          },
        ],
        indices: [
          {
            name: 'IDX_TOKEN',
            columnNames: ['token'],
            isUnique: true,
          },
        ],
      }),
      true
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('RefreshTokens')
  }
}
