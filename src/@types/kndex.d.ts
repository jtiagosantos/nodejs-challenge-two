import 'knex';

declare module 'knex/types/tables' {
  interface Meals {
    id: string;
    session_id: string;
    name: string;
    description: string;
    datetime: Date;
    is_diet: boolean;
  }

  interface Tables {
    meals: Meals;
  }
}
