const { query } = require('./index');

const getAuthData = async (username) => {
  const { rows } = await query('SELECT pl.id, pl.username, pl.hpassword, (SELECT ARRAY((SELECT ro.name FROM decker.roles ro WHERE ro.id IN (SELECT pr.role_id FROM decker.player_roles pr WHERE pr.player_id = pl.id)))) as roles FROM decker.players pl WHERE pl.username = $1', [username]);
  return rows[0];
};

const getPlayer = async (playerId) => {
  const { rows } = await query('select level from characters.stats where player_id = $1;', [playerId]);
  return rows[0];
  // return rows[0];
};

const getPlayersCurrentZone = async (playerId) => {
  const { rows } = await query('select zone_id, entry from exploration.zone_status where player_id = $1;', [playerId]);
  return rows[0];
};

const timeMap = {
  days: 86400,
  hours: 3600,
  minutes: 60,
  seconds: 1,
  milliseconds: 0,
};

const getZoneInfo = async (zoneId) => {
  const { rows } = await query('SELECT zone_cap, zone_level, open, zone_timeout FROM exploration.zones WHERE id = $1;', [zoneId]);
  if (rows.length === 0) return {};
  const timeout = Object.keys(rows[0].zone_timeout)
    .reduce((total, key) =>
      total + (rows[0].zone_timeout[key] * timeMap[key]), 0);
  return {
    isOpen: rows[0].open,
    level: rows[0].zone_level,
    cap: rows[0].zone_cap,
    timeout,
  };
};

const isZoneCapOpen = async (zoneId, zoneCap) => {
  const result = await query('SELECT COUNT(player_id) FROM exploration.zone_status WHERE zone_id = $1;', [zoneId]);
  return result.rows[0].count < zoneCap;
};

const enterRoom = async (userId, roomId, timestamp) => query('SELECT exploration.enter_room($1, $2, $3);', [userId, roomId, timestamp]);

const getZones = async () => { const { rows } = await query('SELECT * FROM exploration.zones'); return rows; };

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

const findLaggingDeckers = async () => {
  //  const { rows } = await query("SELECT esz.zone_id, ez.zone_name, esz.player_id, dp.username, (SELECT (entry - (now() - timeout)) FROM exploration.zone_status) AS budget FROM exploration.zone_status esz, decker.players dp, exploration.zones ez WHERE esz.player_id = dp.id AND ez.id = esz.zone_id AND ((SELECT (entry - (now() - timeout)) FROM exploration.zone_status) < INTERVAL '0' second);;");
  const { rows } = await query('SELECT * from exploration.active_room_timeouts();');
  return rows.map(raw => ({
    zone_id: raw.zone_id,
    zone_name: raw.zone_name,
    player_id: raw.player_id,
    username: raw.username,
    timeout: Object.keys(raw.o_timeout)
      .reduce(
        (total, key) => total + (raw.o_timeout[key] * timeMap[key]),
        0,
      ),
  }));
};

const getCharForUser = async (username) => {
  const { rows } = await query('SELECT cs.humanity, cs.wallet, cs.player_id, cs.level, dp.username from characters.stats cs, decker.players dp where player_id = $1 and cs.player_id = dp.id', [username]);
  return rows[0];
};

const getProducts = async () => {
  const { rows } = await query('SELECT id, name, value FROM characters.upgrades;');
  return rows;
};

const getOrders = async (username) => {
  const { rows } = await query('SELECT * FROM characters.orders where player_id = $1', [username]);
  return rows;
};

const buyUpgradeForDecker = async (username, productId) => {
  const { rows } = await query('select * from characters.buy_upgrade($1, $2);', [username, productId]);
  return rows[0];
};

module.exports = {
  getPlayer,
  getZoneInfo,
  isZoneCapOpen,
  getPlayersCurrentZone,
  getDeckerZoneHistory,
  getAuthData,
  getCharForUser,
  enterRoom,
  getOrders,
  getProducts,
  findLaggingDeckers,
  getZones,
  buyUpgradeForDecker,
};

