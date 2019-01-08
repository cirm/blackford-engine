const { query, first } = require('../db');
const { reccordObjectScan } = require('../db/scan');
const logger = require('../utilities/winston');

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
  const resp = await ctx.db.query('SELECT gn.id, gn.active, gn.captured FROM game.nodes gn WHERE gn.id = $1;', [ctx.params.id]).then(first);
  if (!resp) return readError(ctx);
  if (!resp.captured) {
    ctx.body = {
      active: resp.active,
      captured: 'unclaimed',
      level: resp.level,
    };
    return ctx;
  }
  const capturedData = await ctx.db.query('SELECT nse.node_id, nse.owner, c.decker, nse.captured FROM game.node_status_events nse, characters.deckers c WHERE c.id = nse.owner and nse.node_id = $1 ORDER BY captured DESC limit 1;', [ctx.params.id]).then(first);
  ctx.body = {
    active: resp.active,
    captured: capturedData.captured,
    owner: capturedData.decker,
    level: resp.level,
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
