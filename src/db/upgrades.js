// @flow
const db = require('./index');
const { upgradeType } = require('../mappings');
const logger = require('../utilities/winston');

const handleUpgrade = async (deckerId: number, type: number, orderId: number) => {
  try {
    await db.query(`UPDATE characters.deckers SET ${upgradeType[type]} = ${upgradeType[type]} +1 WHERE id = ${deckerId};`);
    await db.query('UPDATE characters.orders SET status = 1 where id = $1', [orderId]);
  } catch (e) {
    logger.error(e);
    throw new Error('Failed to provision Upgrade');
  }
};

module.exports = {
  handleUpgrade,
};
