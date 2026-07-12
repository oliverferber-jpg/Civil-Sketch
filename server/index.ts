import express, { type Express, type Request, type Response } from 'express';


const app: express = express();
const port = 3001;

app.get('/', (req: Request, res: Response) => {
  res.send("Hiasdfld");
});

app.listen(port, () => {

  console.log(`Example app listening on port ${port}`);
});

/*


let notes = [
  {
    id: '0',
    name: 'John',
    number: '123-456-7890'
  }
]


app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/api/notes', (request, response) => {
  response.json(notes)
})


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

import express, { type Express, type Request, type Response } from 'express';
import { Pool } from 'pg'

const app: Express = express();
const port = 5432;
const pool = new Pool({
  user: 'postgres',
  host: 'Civil-Sketch',
  database: 'Postgres',
  password: '5432',
  port: 5432,
});

app.get('/', (req: Request, res: Response) => {
  pool.query('SELECT NOW()');
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
*/