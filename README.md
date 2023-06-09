
<h1 align="center">Dialy Diet API</h1>

<p align="center">
  <img alt="GitHub language count" src="https://img.shields.io/github/languages/count/jtiagosantos/nodejs-challenge-two?color=%green">
  <img alt="Repository size" src="https://img.shields.io/github/repo-size/jtiagosantos/nodejs-challenge-two?color=blue">
  <a href="https://github.com/jtiagosantos/nodejs-challenge-two/commits/master">
    <img alt="GitHub last commit" src="https://img.shields.io/github/last-commit/jtiagosantos/nodejs-challenge-two?color=purple">
  </a>
  <img alt="License" src="https://img.shields.io/badge/license-MIT-brightgreen?color=orange">
   <a href="https://github.com/jtiagosantos/nodejs-challenge-two/stargazers">
    <img alt="Stargazers" src="https://img.shields.io/github/stars/jtiagosantos/nodejs-challenge-two?style=social">
  </a>
</p>

<h4 align="center"> 
  🚧 Dialy Diet API 🥗 Completed 🚀 🚧
</h4>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-run-project">Run Project</a> • 
  <a href="#-run-tests">Run Tests</a> • 
  <a href="#-technologies">Technologies</a> • 
  <a href="#-author">Author</a> • 
  <a href="#-license">License</a>
</p>

<br>


## ⚙️ Features

- [x] Create a new meal
- [x] List all meals by session
- [x] Get a specific meal by id
- [x] Update one meal
- [x] Delete one meal
- [x] Get metrics about the meals 

<br>

## 🚀 Run Project

1️⃣ Clone project and access its folder:

```bash
$ git clone https://github.com/jtiagosantos/nodejs-challenge-two.git
$ cd nodejs-challenge-two
```

2️⃣ Install dependencies:

```bash
$ npm i
```

3️⃣ Start database:

```bash
$ docker-compose up -d
```

4️⃣ Define environment variables (.env):

```bash
NODE_ENV=

# DATABASE
DATABASE_HOST=
DATABASE_PORT=
DATABASE_USER=
DATABASE_PASSWORD=
DATABASE_NAME=
```

5️⃣ Start project:

```bash
$ npm run dev
```

🔌 **Click the button below to import API routes into Insomnia**

[![Run in Insomnia}](https://insomnia.rest/images/run.svg)](https://insomnia.rest/run/?label=Daily%20Diet%20API&uri=https%3A%2F%2Fraw.githubusercontent.com%2Fjtiagosantos%2Fnodejs-challenge-two%2Fmain%2F.github%2Finsomnia-routes.json)

<br>

## ⚡ Run Tests

1️⃣ Start test database:

```bash
$ docker-compose -f docker-compose.test.yml up -d
```

2️⃣ Define environment variables (.env.test):

```bash
# DATABASE
DATABASE_HOST=
DATABASE_PORT=
DATABASE_USER=
DATABASE_PASSWORD=
DATABASE_NAME=
```

3️⃣ Run tests:

```bash
$ npm run test
```

<br>

## 🛠 Technologies

The following tools were used in the construction of project:

- **[Node.js](https://nodejs.org/en)**
- **[Typescript](https://www.typescriptlang.org/)**
- **[Fastify](https://www.fastify.io/)**
- **[Knex.js](https://knexjs.org/)**
- **[PostgreSQL](https://www.postgresql.org/)**
- **[Zod](https://github.com/colinhacks/zod)**
- **[Tsx](https://www.npmjs.com/package/tsx)**
- **[Tsup](https://tsup.egoist.dev/)**
- **[Vitest](https://vitest.dev/)**
- **[SuperTest](https://www.npmjs.com/package/supertest)**

<br>

## 👨‍💻 Author

<img src="https://avatars.githubusercontent.com/u/63312141?v=4" width="100" alt="Tiago Santos" style="border-radius: 50px;" />

<strong><a href="https://github.com/jtiagosantos">Tiago Santos </a>🚀</strong>

[![Linkedin Badge](https://img.shields.io/badge/linkedin-%230077B5.svg?&style=for-the-badge&logo=linkedin&logoColor=white&link=https://www.linkedin.com/in/jos%C3%A9-tiago-santos-de-lima-aaa4361a4/)](https://www.linkedin.com/in/josetiagosantosdelima/)
[![Gmail Badge](https://img.shields.io/badge/Gmail-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:tiago.santos@icomp.ufam.edu.br)

<br>

## 📝 License

This project is under license [MIT](./LICENSE).
