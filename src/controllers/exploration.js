const db = require('../db/index');

const getPlayer = () => ({
  level: 3,
});

const getZoneInfo = async (zoneId) => {
  const result = await db.query('SELECT zone_cap, zone_level, open FROM decker.zones WHERE id = $1;', [zoneId]);
  if (result.rows.length === 0) return {};
  return {
    isOpen: result.rows[0].open,
    level: result.rows[0].zone_level,
    cap: result.rows[0].zone_cap,
  };
};

const isZoneCapOpen = async (zoneId, zoneCap) => {
  const result = await db.query('SELECT COUNT(player_id) FROM decker.zone_status WHERE zone_id = $1;', [zoneId]);
  return result.rows[0].count < zoneCap;
};

const enterRoom = async (ctx, next) => {
  const player = getPlayer();
  const zone = await getZoneInfo(ctx.params.id);
  if (!zone.isOpen) {
    ctx.status = 401;
    ctx.body = {
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Zone is closed off for decontamination!',
    };
    return ctx;
  }
  if (player.level < zone.level) {
    ctx.status = 401;
    ctx.body = {
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Get serious kid, do you have a deathwish? Get some more exp!',
    };
    return ctx;
  }
  const canFit = await isZoneCapOpen(ctx.params.id, zone.cap);
  if (!canFit) {
    ctx.status = 401;
    ctx.body = {
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Too slow, zone if full!',
    };
    return ctx;
  }
  const resp = await db.query('SELECT decker.enter_room($1, $2, $3, $4)', [ctx.user.id, ctx.params.id, new Date(), 300]);
  console.log(resp);
  ctx.body = { status: 'Entry granted', timestamp: new Date(), alert: new Date() };
  return next();
};


module.exports = {
  enterRoom,
};
