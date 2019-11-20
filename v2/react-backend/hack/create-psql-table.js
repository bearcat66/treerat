const pg = require('pg');
const connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/points'
const client = new pg.Client(connectionString);
createTable(client)
async function createTable(client) {
  client.connect();
  const query = await client.query('CREATE TABLE users(id SERIAL PRIMARY KEY, text VARCHAR(40) not null, complete BOOLEAN)');
  console.log(query)
  await client.end()
}
