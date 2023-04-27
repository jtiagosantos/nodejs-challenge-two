export class MealNotFoundError extends Error {
  constructor() {
    super('Meal not found');
  }
}
