const { query, first } = require('../db');
const dbQuery = require('../db/decker');
const { changeBalance } = require('../db/balance');
const { logPK, logPurge, logMobKill } = require('../db/deaths');

const nukeDecker = async (ctx) => {
// log Kill
// add bounty
  const killerId = ctx.user.id;
  const victimId = ctx.params.playerId;
  const promiseArray = await Promise.all([
    query('SELECT * FROM exploration.zone_status WHERE decker_id = $1', [killerId]).then(first),
    query('SELECT level FROM characters.deckers where id = $1', [killerId]).then(first),
    query('SELECT level, decker FROM characters.deckers where id = $1', [victimId]).then(first)]);
  const { zone_id } = promiseArray[0];
  const killer = promiseArray[1];
  const victim = promiseArray[1];
  if (killer.level < victim.level) {
    await changeBalance(killerId, 1000 * victim.level);
  } else if (killer.level === victim.level) {
    await changeBalance(killerId, 500 * victim.level);
  }
  await logPK(killerId, killer.level, victimId, victim.level, zone_id, false);
  await dbQuery.enterRoom(victimId, 1, new Date());
  ctx.body = {
    status: 'Nuked a decker', ...victim,
  };
};

const ravageDecker = async (ctx) => {
  const killerId = ctx.user.id;
  const victimId = ctx.params.playerId;
  const promiseArray = await Promise.all([
    ctx.db.query('SELECT * FROM exploration.zone_status WHERE decker_id = $1', [killerId]).then(first),
    ctx.db.query('SELECT level, wallet FROM characters.deckers where id = $1', [killerId]).then(first),
    ctx.db.query('SELECT level, wallet, decker FROM characters.deckers where id = $1', [victimId]).then(first)]);
  const { zone_id } = promiseArray[0];
  const killer = promiseArray[1];
  const victim = promiseArray[2];
  const loot = victim.wallet >= 1000 ? Math.round(victim.wallet / 4) : 250;
  await changeBalance(victimId, -loot);
  if (killer.level < victim.level) {
    await changeBalance(killerId, (1000 * victim.level) + loot);
  } else if (killer.level === victim.level) {
    await changeBalance(killerId, (500 * victim.level) + loot);
  } else {
    await changeBalance(killerId, loot);
  }
  await logPK(killerId, killer.level, victimId, victim.level, zone_id, true);
  await dbQuery.enterRoom(victimId, 1, new Date());
  ctx.body = {
    status: 'Nuked a decker', ...victim,
  };
};

const purgeDecker = async (ctx) => {
  const mobId = ctx.request.body.id;
  const victimId = ctx.params.deckerId;
  const promiseArray = await Promise.all([
    query('SELECT * FROM exploration.zone_status WHERE decker_id = $1', [victimId]).then(first),
    query('SELECT level, decker FROM characters.deckers where id = $1', [victimId]).then(first)]);
  const { zone_id } = promiseArray[0];
  const victim = promiseArray[1];
  await logPurge(victimId, victim.level, mobId, zone_id);
  await dbQuery.enterRoom(victimId, 1, new Date());
  ctx.body = {
    status: 'Decker purged from the system', ...victim,
  };
};

const nukeMob = async (ctx) => {
  // log kill
  // add bounty
  const mob = await ctx.db.query('SELECT * FROM game.mobs where id = $1', [ctx.params.mobId]).then(first);
  await changeBalance(ctx.user.id, mob.bounty);
  const promiseArray = await Promise.all([
    query('SELECT * FROM exploration.zone_status WHERE decker_id = $1', [ctx.user.id]).then(first),
    query('SELECT level FROM characters.deckers where id = $1', [ctx.user.id]).then(first)]);
  const { zone_id } = promiseArray[0];
  const { level } = promiseArray[1];
  await logMobKill(ctx.user.id, level, ctx.params.mobId, zone_id);
  ctx.body = {
    status: 'Nuked a mob', level: mob.level, bounty: mob.bounty, meta: mob.meta,
  };
};

module.exports = {
  nukeDecker,
  nukeMob,
  purgeDecker,
  ravageDecker,
};
