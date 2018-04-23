const db = require('../db');
const logger = require('../utilities/winston');
const mappings = require('../mappings');

const handleUpdate = async (payload) => {
  try {
    await db.query('BEGIN');
    await db.query(`UPDATE characters.stats SET ${mappings.upgradeType[payload.type]} = ${mappings.upgradeType[payload.type]} +1;`);
    await db.query('UPDATE characters.orders SET status = 1 where id = $1', [payload.order_id]);
    await db.query('COMMIT');
  } catch (e) {
    await db.query('ROLLBACK');
    logger.error(e);
  }
};

const orderConsumer = async (msg, ch) => {
  const mqPayload = JSON.parse(msg.content.toString('utf8').trim());
  try {
    const { rows } = await db.query('SELECT co.id AS order_id, co.status, co.upgrade_id, cu.type, cu.value from characters.orders co, characters.upgrades cu WHERE co.id = $1 AND co.upgrade_id = cu.id', [mqPayload.orderId]);
    const orderStatus = rows[0];
    if (orderStatus && orderStatus.status === 0) {
      await handleUpdate(orderStatus);
    }
    ch.ack(msg);
  } catch (e) {
    logger.error(e);
  }
};

module.exports = {
  orderConsumer,
};
