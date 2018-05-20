const { query } = require('./index');
const logger = require('../utilities/winston');
const { timeMap } = require('../mappings');

const findLaggingDeckers = async () => {
  const { rows } = await query('SELECT * FROM exploration.active_room_timeouts();');
  return rows.map(raw => ({
    zone_id: raw.zone_id,
    zone_name: raw.zone_name,
    player_id: raw.player_id,
    username: raw.username,
    timeout: Object.keys(raw._timeout)
      .reduce(
        (total, key) => total + (raw._timeout[key] * timeMap[key]),
        0,
      ),
  }));
};

const getDeckerZoneHistory = async (playerId) => {
  const { rows } = await query('SELECT ez.zone_name, dp.username, ezh.entry, ezh.exit, ezh.budget FROM exploration.zone_history ezh, exploration.zones ez, decker.players dp WHERE ezh.player_id = $1 and ezh.zone_id = ez.id AND dp.id = $1 ORDER BY ezh.entry', [playerId]);
  return rows.map(logEntry => ({
    ...logEntry,
    budget: Object.keys(logEntry.budget)
      .reduce(
        (total, key) => total + (logEntry.budget[key] * timeMap[key]),
        0,
      ),
  }));
};

const getZones = async () => { const { rows } = await query('SELECT * FROM exploration.zones'); return rows; };

const createUser = async (username, hpassword) => {
  try {
    const { rows } = await query('INSERT INTO decker.players (username, hpassword) VALUES ($1, $2) RETURNING id', [username, hpassword]);
    await query('INSERT INTO decker.player_roles (player_id, role_id) VALUES ($1, 3)', [rows[0].id]);
    const response = await query('SELECT * FROM characters.create_char($1)', [rows[0].id]);
    return response.rows[0];
  } catch (e) {
    logger.error(e);
    return e;
  }
};

const provisionBudget = async (userId, ammount = 1000) => {
  try {
    const { rows } = await query('UPDATE characters.stats SET wallet = $2 WHERE player_id = $1 RETURNING wallet, player_id;', [userId, ammount]);
    return rows[0];
  } catch (e) {
    logger.error(e);
    return e;
  }
};

module.exports = {
  findLaggingDeckers,
  getDeckerZoneHistory,
  getZones,
  createUser,
  provisionBudget,
};
