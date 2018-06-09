const db = require('../db');
const logger = require('../utilities/winston');

const handleObjectScan = async (user, value, item) => {
  const { rows } = await db.query('SELECT * FROM game.decker2objects WHERE decker_id = $1 AND object_id = $2', [user, item]);
  if (!rows.lentgh) {
    try {
      await db.query('BEGIN');
      await db.query('INSERT INTO game.decker2objects (decker_id, object_id) VALUES ($1, $2)', [user, item]);
      await db.query('UPDATE characters.deckers SET wallet = wallet + $1 WHERE id = $2;', [value, user]);
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
