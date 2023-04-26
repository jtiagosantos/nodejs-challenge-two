import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('diets', (table) => {
    table.uuid('id').primary();
    table.uuid('session_id').index();
    table.text('name').notNullable();
    table.text('description').notNullable();
    table.datetime('datetime').notNullable();
    table.boolean('is_diet').notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('diets');
}
