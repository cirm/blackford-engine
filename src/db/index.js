const { Pool } = require('pg').native;
const logger = require('../utilities/winston');

const config = {
  user: 'spark',
  password: 'salasala',
  host: 'localhost',
  database: 'cyberpunk',
};

const pool = new Pool(config);

module.exports = {
  query: async (text, params) => {
    const start = Date.now();
    const result = await pool.query(text, params);
    const duration = `${Date.now() - start} ms`;
    logger.debug('executed query', { text, duration, rows: result.rowCount });
    return result;
  },
};
