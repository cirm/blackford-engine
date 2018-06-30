// @flow
const db = require('../db');
const logger = require('../utilities/winston');

const changeBalance = async (decker: string, value: string) => {
  try {
    await db.query('UPDATE characters.deckers SET wallet = wallet + $1 WHERE id = $2;', [value, decker]);
  } catch (e) {
    logger.error(e);
    throw new Error('Failed to change balance');
  }
};

module.exports = {
  changeBalance,
};
