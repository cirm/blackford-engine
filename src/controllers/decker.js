const { query } = require('../db');
const dbQuery = require('../db/decker');
const { changeBalance } = require('../db/balance');
const { logPK, logPurge, logMobKill } = require('../db/deaths');

const nukeDecker = async (ctx, next) => {
// log Kill
// add bounty
  const killer = ctx.user.id;
  const victimId = ctx.params.playerId;
  const promiseArray = await Promise.all([
    query('SELECT * FROM exploration.zone_status WHERE decker_id = $1', [killer]),
    query('SELECT level FROM characters.deckers where id = $1', [killer]),
    query('SELECT level, decker FROM characters.deckers where id = $1', [victimId])]);
  const { zone_id } = promiseArray[0].rows[0];
  const klevel = promiseArray[1].rows[0].level;
  const victim = promiseArray[1].rows[0];
  if (klevel < victim.level) {
    await changeBalance(killer, 1000 * victim.level);
  } else if (klevel === victim.level) {
    await changeBalance(killer, 500 * victim.level);
  }
  await logPK(killer, klevel, victimId, victim.level, zone_id, false);
  await dbQuery.enterRoom(victimId, 1, new Date());
  ctx.body = {
    status: 'Nuked a decker', ...victim,
  };
  return next();
};

const ravageDecker = async (ctx, next) => {
  const killer = ctx.user.id;
  const victimId = ctx.params.playerId;
  const promiseArray = await Promise.all([
    query('SELECT * FROM exploration.zone_status WHERE decker_id = $1', [killer]),
    query('SELECT level, wallet FROM characters.deckers where id = $1', [killer]),
    query('SELECT level, wallet, decker FROM characters.deckers where id = $1', [victimId])]);
  const { zone_id } = promiseArray[0].rows[0];
  const klevel = promiseArray[1].rows[0].level;
  const victim = promiseArray[1].rows[0];
  const loot = victim.wallet >= 1000 ? Math.round(victim.wallet / 4) : 250;
  await changeBalance(victimId, -loot);
  if (klevel < victim.level) {
    await changeBalance(killer, (1000 * victim.level) + loot);
  } else if (klevel === victim.level) {
    await changeBalance(killer, (500 * victim.level) + loot);
  } else {
    await changeBalance(killer, loot);
  }
  await logPK(killer, klevel, victimId, victim.level, zone_id, true);
  await dbQuery.enterRoom(victimId, 1, new Date());
  ctx.body = {
    status: 'Nuked a decker', ...victim,
  };
  return next();
};

const purgeDecker = async (ctx, next) => {
  const mob = ctx.request.body.id;
  const victimId = ctx.params.deckerId;
  const promiseArray = await Promise.all([
    query('SELECT * FROM exploration.zone_status WHERE decker_id = $1', [victimId]),
    query('SELECT level, decker FROM characters.deckers where id = $1', [victimId])]);
  const { zone_id } = promiseArray[0].rows[0];
  const victim = promiseArray[1].rows[0];
  await logPurge(victimId, victim.level, mob, zone_id);
  await dbQuery.enterRoom(victimId, 1, new Date());
  ctx.body = {
    status: 'Decker purged from the system', ...victim,
  };
  return next();
};

const nukeMob = async (ctx, next) => {
  const { mobId } = ctx.params;
  // log kill
  // add bounty
  const { rows } = await query('SELECT * FROM game.mobs where id = $1', [mobId]);
  const mob = rows[0];
  await changeBalance(ctx.user.id, mob.bounty);
  const promiseArray = await Promise.all([
    query('SELECT * FROM exploration.zone_status WHERE decker_id = $1', [ctx.user.id]),
    query('SELECT level FROM characters.deckers where id = $1', [ctx.user.id])]);
  const { zone_id } = promiseArray[0].rows[0];
  const { level } = promiseArray[1].rows[0];
  await logMobKill(ctx.user.id, level, mobId, zone_id);
  ctx.body = {
    status: 'Nuked a mob', level: mob.level, bounty: mob.bounty, meta: mob.meta,
  };
  return next();
};

module.exports = {
  nukeDecker,
  nukeMob,
  purgeDecker,
  ravageDecker,
};
