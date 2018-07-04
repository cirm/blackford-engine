// @flow
const { query } = require('./index');
const { timeMap } = require('../mappings');

const getUserAccount = 'SELECT * FROM account.get_account_data($1);';
// const getPlayer = 'SELECT level FROM characters.deckers WHERE id = $1';
const getProducts = 'SELECT id, name, value FROM characters.upgrades;';

const getAuthData = async (username, dbq) => {
  const { rows } = await dbq('SELECT * from account.get_account_data($1)', [username]);
  return rows[0];
};

const getPlayer = async (playerId) => {
  const { rows } = await query('SELECT level FROM characters.deckers WHERE id = $1;', [playerId]);
  return rows[0];
};

const getPlayersCurrentZone = async (playerId) => {
  const { rows } = await query('SELECT zone_id, entry FROM exploration.zone_status WHERE decker_id = $1;', [playerId]);
  return rows[0];
};

const getZoneInfo = async (zoneId) => {
  const { rows } = await query('SELECT zone_cap, zone_level, open, zone_timeout FROM exploration.zones WHERE id = $1;', [zoneId]);
  if (rows.length === 0) return {};
  const timeout = Object.keys(rows[0].zone_timeout)
    .reduce((total, key) => total + (rows[0].zone_timeout[key] * timeMap[key]), 0);
  return {
    isOpen: rows[0].open,
    level: rows[0].zone_level,
    cap: rows[0].zone_cap,
    timeout,
  };
};

const isZoneCapOpen = async (zoneId, zoneCap) => {
  const result = await query('SELECT COUNT(decker_id) FROM exploration.zone_status WHERE zone_id = $1;', [zoneId]);
  return result.rows[0].count < zoneCap;
};

const enterRoom = async (deckerId, roomId, timestamp) => query('SELECT exploration.enter_room($1, $2, $3);', [deckerId, roomId, timestamp]);

const getCharForUser = 'SELECT cs.humanity, cs.wallet, cs.id, cs.level, cs.decker FROM characters.deckers cs WHERE id = $1';

const getProducts1 = async (dbq) => {
  const { rows } = await dbq('SELECT id, name, value FROM characters.upgrades;');
  return rows;
};

const getOrders = 'SELECT * FROM characters.orders where decker_id = $1';
const buyUpgradeForDecker = 'SELECT * FROM characters.buy_upgrade($1, $2);';

module.exports = {
  getProducts,
  getPlayer,
  getZoneInfo,
  isZoneCapOpen,
  getPlayersCurrentZone,
  getAuthData,
  getCharForUser,
  enterRoom,
  getOrders,
  buyUpgradeForDecker,
};
