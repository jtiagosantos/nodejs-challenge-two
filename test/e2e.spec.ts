import { execSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';

const { server } = app;

beforeAll(async () => {
  await app.ready();
});

afterAll(async () => {
  await app.close();
});

describe('Meal routes', () => {
  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all');
    execSync('npm run knex migrate:latest');
  });

  it('should be able to create a new meal', async () => {
    const { text: requiredNameErrorText } = await request(server).post('/meals').send({
      description: 'Salada saudável de legumes',
      datetime: new Date(),
      isDiet: true,
    });

    expect(requiredNameErrorText.match(/name is a required field/)).toBeTruthy();

    const { text: requiredDescriptionErrorText } = await request(server)
      .post('/meals')
      .send({
        name: 'Salada',
        datetime: new Date(),
        isDiet: true,
      });

    expect(
      requiredDescriptionErrorText.match(/description is a required field/),
    ).toBeTruthy();

    const { text: requiredDatetimeErrorText } = await request(server)
      .post('/meals')
      .send({
        name: 'Salada',
        description: 'Salada saudável de legumes',
        isDiet: true,
      });

    expect(requiredDatetimeErrorText.match(/datetime is a required field/)).toBeTruthy();

    const { text: requiredIsDietErrorText } = await request(server).post('/meals').send({
      name: 'Salada',
      description: 'Salada saudável de legumes',
      datetime: new Date(),
    });

    expect(requiredIsDietErrorText.match(/isDiet is a required field/)).toBeTruthy();

    await request(server)
      .post('/meals')
      .send({
        name: 'Salada',
        description: 'Salada saudável de legumes',
        datetime: new Date(),
        isDiet: true,
      })
      .expect(201);
  });

  it('should be able to list many meals', async () => {
    const { text: unauthorizedErrorText } = await request(server).get('/meals');

    expect(unauthorizedErrorText.match(/Unauthorized/)).toBeTruthy();

    const datetime = new Date();

    const createMealResponse = await request(server).post('/meals').send({
      name: 'Salada',
      description: 'Salada saudável de legumes',
      datetime,
      isDiet: true,
    });

    const cookies = createMealResponse.get('Set-Cookie');

    await request(server)
      .post('/meals')
      .send({
        name: 'Batata frita',
        description: 'Batata frita crocante',
        datetime,
        isDiet: false,
      })
      .set('Cookie', cookies);

    const response = await request(server).get('/meals').set('Cookie', cookies);

    expect(response.body.meals).toEqual([
      expect.objectContaining({
        name: 'Salada',
        description: 'Salada saudável de legumes',
        datetime: datetime.toISOString(),
        is_diet: true,
      }),
      expect.objectContaining({
        name: 'Batata frita',
        description: 'Batata frita crocante',
        datetime: datetime.toISOString(),
        is_diet: false,
      }),
    ]);
  });

  it('should be able to find a specific meal', async () => {
    const { text: unauthorizedErrorText } = await request(server).get('/meals');

    expect(unauthorizedErrorText.match(/Unauthorized/)).toBeTruthy();

    const datetime = new Date();

    const createMealResponse = await request(server).post('/meals').send({
      name: 'Salada',
      description: 'Salada saudável de legumes',
      datetime,
      isDiet: true,
    });

    const cookies = createMealResponse.get('Set-Cookie');

    const listManyMeals = await request(server).get('/meals').set('Cookie', cookies);

    const mealId = listManyMeals.body.meals[0].id;

    const findMealResponse = await request(server)
      .get(`/meals/${mealId}`)
      .set('Cookie', cookies);

    expect(findMealResponse.body).toEqual(
      expect.objectContaining({
        id: mealId,
        name: 'Salada',
        description: 'Salada saudável de legumes',
        datetime: datetime.toISOString(),
        is_diet: true,
      }),
    );

    const { text: invalidIdErrorText } = await request(server)
      .get('/meals/any-id')
      .set('Cookie', cookies);

    expect(invalidIdErrorText.match(/mealId should be a UUID/)).toBeTruthy();

    const { text: mealNotFoundErrorText } = await request(server)
      .get(`/meals/${randomUUID()}`)
      .set('Cookie', cookies);

    expect(mealNotFoundErrorText.match(/Meal not found/)).toBeTruthy();
  });

  it('should be able to get the metrics', async () => {
    const { text: unauthorizedErrorText } = await request(server).get('/meals/metrics');

    expect(unauthorizedErrorText.match(/Unauthorized/)).toBeTruthy();

    const createMealResponse = await request(server).post('/meals').send({
      name: 'Salada',
      description: 'Salada saudável de legumes',
      datetime: new Date(),
      isDiet: true,
    });

    const cookies = createMealResponse.get('Set-Cookie');

    await request(server).post('/meals').set('Cookie', cookies).send({
      name: 'Batata frita',
      description: 'Batata frita crocante',
      datetime: new Date(),
      isDiet: false,
    });
    await request(server).post('/meals').set('Cookie', cookies).send({
      name: 'Torrada integral',
      description: 'Deliciosa torrada integral com geleia',
      datetime: new Date(),
      isDiet: true,
    });
    await request(server).post('/meals').set('Cookie', cookies).send({
      name: 'Suco de maracujá',
      description: 'Suco de maracujá com ortelã',
      datetime: new Date(),
      isDiet: true,
    });
    await request(server).post('/meals').set('Cookie', cookies).send({
      name: 'Hot Dog',
      description: 'Pão com salsicha, molho e batata palha',
      datetime: new Date(),
      isDiet: false,
    });

    const findMetricsResponse = await request(server)
      .get('/meals/metrics')
      .set('Cookie', cookies);

    expect(findMetricsResponse.body).toEqual({
      totalMeals: 5,
      mealsWithinTheDiet: 3,
      offDietMeals: 2,
      bestSequenceWithinTheDiet: 2,
    });
  });

  it('should be able to update one meal', async () => {
    const { text: unauthorizedErrorText } = await request(server).put(
      `/meals/${randomUUID()}`,
    );

    expect(unauthorizedErrorText.match(/Unauthorized/)).toBeTruthy();

    const createMealResponse = await request(server).post('/meals').send({
      name: 'Salada',
      description: 'Salada saudável de legumes',
      datetime: new Date(),
      isDiet: true,
    });

    const cookies = createMealResponse.get('Set-Cookie');

    const listManyMeals = await request(server).get('/meals').set('Cookie', cookies);

    const mealId = listManyMeals.body.meals[0].id;

    const { text: invalidIdErrorText } = await request(server)
      .put('/meals/any-id')
      .send({})
      .set('Cookie', cookies);

    expect(invalidIdErrorText.match(/mealId should be a UUID/)).toBeTruthy();

    const { text: mealNotFoundErrorText } = await request(server)
      .put(`/meals/${randomUUID()}`)
      .send({})
      .set('Cookie', cookies);

    expect(mealNotFoundErrorText.match(/Meal not found/)).toBeTruthy();

    await request(server)
      .put(`/meals/${mealId}`)
      .send({
        name: 'Batata frita',
        description: 'Batata frita crocante',
        isDiet: false,
      })
      .set('Cookie', cookies);

    const findMealResponse = await request(server)
      .get(`/meals/${mealId}`)
      .set('Cookie', cookies);

    expect(findMealResponse.body).toEqual(
      expect.objectContaining({
        id: mealId,
        name: 'Batata frita',
        description: 'Batata frita crocante',
        is_diet: false,
      }),
    );
  });

  it('should be able to delete one meal', async () => {
    const { text: unauthorizedErrorText } = await request(server).delete(
      `/meals/${randomUUID()}`,
    );

    expect(unauthorizedErrorText.match(/Unauthorized/)).toBeTruthy();

    const createMealResponse = await request(server).post('/meals').send({
      name: 'Salada',
      description: 'Salada saudável de legumes',
      datetime: new Date(),
      isDiet: true,
    });

    const cookies = createMealResponse.get('Set-Cookie');

    const listManyMeals = await request(server).get('/meals').set('Cookie', cookies);

    const mealId = listManyMeals.body.meals[0].id;

    const { text: invalidIdErrorText } = await request(server)
      .delete('/meals/any-id')
      .set('Cookie', cookies);

    expect(invalidIdErrorText.match(/mealId should be a UUID/)).toBeTruthy();

    const { text: mealNotFoundErrorText } = await request(server)
      .delete(`/meals/${randomUUID()}`)
      .set('Cookie', cookies);

    expect(mealNotFoundErrorText.match(/Meal not found/)).toBeTruthy();

    await request(server).delete(`/meals/${mealId}`).set('Cookie', cookies);

    const findMealResponse = await request(server)
      .get(`/meals/${mealId}`)
      .set('Cookie', cookies);

    expect(findMealResponse.text.match(/Meal not found/)).toBeTruthy();
  });
});
