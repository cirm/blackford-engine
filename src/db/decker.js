const { query } = require('./index');

const getPlayer = async (playerId) => {
  const { rows } = await query('select level from characters.stats where player_id = $1;', [playerId]);
  return { level: 3 };
  // return rows[0];
};

const timeMap = {
  hours: 3600,
  minutes: 60,
  secconds: 1,
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

module.exports = {
  getPlayer,
  getZoneInfo,
  isZoneCapOpen,
  enterRoom,
};

