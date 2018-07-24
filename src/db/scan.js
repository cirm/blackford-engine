const { query, transaction } = require('./index');
const logger = require('../utilities/winston');

const reccordObjectScan = async (user, item, value) => {
  const { rows } = await query('SELECT * FROM game.decker2objects WHERE decker_id = $1 AND object_id = $2', [user, item]);
  if (!rows.lentgh) {
    try {
      transaction(
        ['INSERT INTO game.decker2objects (decker_id, object_id) VALUES ($1, $2)', [user, item]],
        ['UPDATE characters.deckers SET wallet = wallet + $1 WHERE id = $2;', [value, user]],
      );
    } catch (e) {
      logger.error(e);
      throw new Error('Error while scanning');
    }
  }
};

module.exports = {
  reccordObjectScan,
};
