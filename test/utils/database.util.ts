import { DataSource } from 'typeorm';

export async function clearDatabase(dataSource: DataSource) {
  const entities = dataSource.entityMetadatas;

  // Drop all tables in reverse order to handle foreign key constraints
  for (const entity of entities.reverse()) {
    await dataSource.query(`TRUNCATE TABLE "${entity.tableName}" CASCADE;`);
  }
}

export async function resetAutoIncrement(dataSource: DataSource) {
  const entities = dataSource.entityMetadatas;

  for (const entity of entities) {
    const hasIdentityColumn = entity.columns.some(
      (column) => column.isGenerated,
    );
    if (hasIdentityColumn) {
      await dataSource.query(
        `ALTER SEQUENCE "${entity.tableName}_id_seq" RESTART WITH 1;`,
      );
    }
  }
}
