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

const transaction = async (...queries: Array<[string, ?[mixed]]>) => {
  const start = Date.now();
  const tx = await pool.connect();
  try {
    await tx.query('BEGIN');
    await Promise.all(queries.map(q => tx.query(q[0], q[1])));
    await tx.query('COMMIT');
    const duration = `${Date.now() - start} ms`;
    logger.debug('executed query', {
      query: queries.map(q => q[0]), duration, params: queries.map(q => q[1]),
    });
  } catch (e) {
    await tx.query('ROLLBACK');
    logger.error(e);
    throw new Error('Failed to handle a Transaction');
  } finally {
    tx.release();
  }
};

const first = ({ rows }) => rows[0];
const all = ({ rows }) => rows;

module.exports = {
  query,
  transaction,
  all,
  first,
};
