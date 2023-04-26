import 'knex';

declare module 'knex/types/tables' {
  interface Diets {
    id: string;
    session_id: string;
    name: string;
    description: string;
    datetime: Date;
    is_diet: boolean;
  }

  interface Tables {
    diets: Diets;
  }
}
