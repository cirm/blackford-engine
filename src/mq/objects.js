const db = require('../db');
const logger = require('../utilities/winston');

const handleObjectScan = async (user, value, item) => {
  const { rows } = await db.query('SELECT * from game.player2objects where player_id = $1 and object_id = $2', [user, item]);
  if (!rows.lentgh) {
    try {
      await db.query('BEGIN');
      await db.query('INSERT into game.player2objects (player_id, object_id) VALUES ($1, $2)', [user, item]);
      await db.query('UPDATE characters.stats SET wallet = wallet + $1 WHERE player_id = $2;', [value, user]);
      await db.query('COMMIT');
    } catch (e) {
      await db.query('ROLLBACK');
      logger.error(e);
    }
  }
};

const objectConsumer = async (msg, ch) => {
  const mqPayload = JSON.parse(msg.content.toString('utf8').trim());
  try {
    await handleObjectScan(mqPayload.decker, mqPayload.value, mqPayload.item);
    ch.ack(msg);
  } catch (e) {
    logger.error(e);
  }
};

module.exports = {
  objectConsumer,
};
