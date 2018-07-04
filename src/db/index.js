// @flow

const { Pool } = require('pg').native;
const logger = require('../utilities/winston');

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
};

const pool = new Pool(config);

const query = async (text: string, params: ?Array<mixed> = []) => {
  const start = Date.now();
  const result = await pool.query(text, params);
  const duration = `${Date.now() - start} ms`;
  logger.debug('executed query', {
    query: text, duration, rows: result.rowCount, params,
  });
  return result;
};

const first = ({ rows }) => rows[0];
const all = ({ rows }) => rows;

module.exports = {
  query,
  all,
  first,
};
