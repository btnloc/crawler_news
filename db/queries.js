const Pool = require("pg").Pool;
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "crawldb",
  password: "123456",
  port: 5432,
});

const storeData = async (request) => {
  const data = [...request];

  for (const item of data) {
    pool.query(
      "INSERT INTO data (id, domain, title, link) VALUES ($1, $2, $3, $4) on conflict (id) do nothing;",
      [item.id, item.domain, item.title, item.link]
    );
  }
  return data;
};

const getData = (request, response) => {
  pool.query('SELECT * FROM data ORDER BY id ASC', (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
}

module.exports = {
  storeData,
  getData
};
