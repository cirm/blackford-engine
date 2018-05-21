const { scanMap } = require('../mappings');
const { query } = require('../db');

const readError = (ctx) => {
  ctx.body = {
    error: 'No luck Sherlock',
  };
  ctx.status = 400;
  return ctx;
};

const readPlayer = async (ctx, next) => {
  const { rows } = await query('SELECT ch.level, ch.humanity, dp.username FROM characters.stats ch, decker.players dp WHERE ch.player_id = $1 AND ch.player_id = dp.id', [ctx.params.id]);
  if (!rows.length) return readError(ctx);
  ctx.body = {
    decker: rows[0].username, humanity: rows[0].humanity, level: rows[0].level, misc: { bio: 'TBD' }, // TODO: Implement bio.
  };
  return next();
};

const readNode = async (ctx, next) => {
  const { rows } = await query('SELECT gn.id, gn.active, dp.username AS owner, gn.level FROM game.nodes gn LEFT OUTER JOIN decker.players dp ON (gn.owner = dp.id) WHERE gn.id = $1;', [ctx.params.id]);
  if (!rows.length) return readError(ctx);
  ctx.body = {
    active: rows[0].active,
    owner: rows[0].owner ? rows[0].owner : 'unclaimed',
    level: rows[0].level,
  };
  return next();
};

const readMob = async (ctx, next) => {
  const { rows } = await query('SELECT level, bounty, meta FROM game.mobs WHERe id = $1', [ctx.params.id]);
  if (!rows.length) return readError(ctx);
  ctx.body = {
    ...rows[0],
  };
  return next();
};
const readItem = async (ctx, next) => {
  const { rows } = await query('SELECT type, meta FROM game.objects WHERE id = $1', [ctx.params.id]);
  if (!rows.length) return readError(ctx);
  // TODO implement read status
  ctx.body = {
    ...rows[0],
  };
  return next();
};

const scanReader = async (ctx, next) => {
  if (!ctx.params.type) return readError(ctx);
  switch (ctx.params.type) {
    case 'player':
      return readPlayer(ctx, next);
    case 'node':
      return readNode(ctx, next);
    case 'mob':
      return readMob(ctx, next);
    case 'item':
      return readItem(ctx, next);
    default:
      return readError(ctx);
  }
};


module.exports = { readItem: scanReader };
