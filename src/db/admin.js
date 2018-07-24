const Promise = require('bluebird');
const { query, first, all } = require('./index');
const logger = require('../utilities/winston');
const { timeMap } = require('../mappings');

const findLaggingDeckers = async () => query('SELECT * FROM exploration.active_room_timeouts();').then(all).then(rows => rows.map(raw => ({
  zone_id: raw.zone_id,
  zone_name: raw.zone_name,
  player_id: raw.player_id,
  username: raw.username,
  timeout: Object.keys(raw._timeout)
    .reduce(
      (total, key) => total + (raw._timeout[key] * timeMap[key]),
      0,
    ),
})));


const getDeckerZoneHistory = async deckerId => query('SELECT ez.zone_name, cd.decker, ezh.entry, ezh.exit, ezh.budget FROM exploration.zone_history ezh, exploration.zones ez, characters.deckers cd WHERE ezh.decker_id = $1 and ezh.zone_id = ez.id AND cd.id = $1 ORDER BY ezh.entry', [deckerId]).then(all).then(rows => rows.map(logEntry => ({
  ...logEntry,
  budget: Object.keys(logEntry.budget)
    .reduce(
      (total, key) => total + (logEntry.budget[key] * timeMap[key]),
      0,
    ),
})));


const getZones = async () => query('SELECT * FROM exploration.zones').then(all);

const createUser = async (decker, hpassword) => {
  try {
    const { id } = await query('INSERT INTO account.authentication (hpassword) VALUES ($1) RETURNING id', [hpassword]).then(first);
    if (id) {
      const response = await Promise.all([
        query('INSERT INTO account.player_roles (account_id, role_id) VALUES ($1, 2)', [id]), // decker role
        query('SELECT * FROM characters.create_decker($1, $2)', [id, decker]).then(first),
      ]);
      return response[1];
    }
  } catch (e) {
    logger.error(e);
    throw e;
  }
};

const provisionBudget = async (userId, ammount = 1000) => query('UPDATE characters.deckers SET wallet = $2 WHERE id = $1 RETURNING wallet, id;', [userId, ammount]).then(first);

module.exports = {
  findLaggingDeckers,
  getDeckerZoneHistory,
  getZones,
  createUser,
  provisionBudget,
};
