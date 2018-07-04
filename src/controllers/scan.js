const { query } = require('../db');
const { reccordObjectScan } = require('../db/scan');

const readError = (ctx) => {
  ctx.body = {
    error: 'No luck Sherlock',
  };
  ctx.status = 400;
};

const readPlayer = async (ctx) => {
  const { rows } = await query('SELECT cd.level, cd.humanity, cd.decker FROM characters.deckers cd WHERE cd.id = $1', [ctx.params.id]);
  if (!rows.length) return readError(ctx);
  ctx.body = {
    decker: rows[0].decker, humanity: rows[0].humanity, level: rows[0].level, misc: { bio: 'TBD' }, // TODO: Implement bio.
  };
};

const readNode = async (ctx) => {
  const { rows } = await query('SELECT gn.id, gn.active, cd.decker AS owner, gn.level FROM game.nodes gn LEFT OUTER JOIN characters.deckers cd ON (gn.owner = cd.id) WHERE gn.id = $1;', [ctx.params.id]);
  if (!rows.length) return readError(ctx);
  ctx.body = {
    active: rows[0].active,
    owner: rows[0].owner ? rows[0].owner : 'unclaimed',
    level: rows[0].level,
  };
};

const readMob = async (ctx) => {
  const { rows } = await query('SELECT level, bounty, meta FROM game.mobs WHERe id = $1', [ctx.params.id]);
  if (!rows.length) return readError(ctx);
  ctx.body = {
    ...rows[0],
  };
};
const readItem = async (ctx) => {
  const { rows } = await query('SELECT type, meta, value FROM game.objects WHERE id = $1', [ctx.params.id]);
  if (!rows.length) return readError(ctx);
  if (rows[0].value) await reccordObjectScan(ctx.user.id, ctx.params.id, rows[0].value);
  ctx.body = {
    type: rows[0].type,
    meta: rows[0].meta,
  };
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
