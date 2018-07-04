const { query } = require('./index');
const logger = require('../utilities/winston');

const logMobKill = async (decker, dlevel, mob, location) => {
  try {
    await query('INSERT INTO characters.trophies (killer, killer_level, mob, location, timestamp) VALUES ($1, $2, $3, $4, now());', [decker, dlevel, mob, location]);
  } catch (e) {
    logger.error(e);
  }
};

const logPK = async (killer, klevel, victim, vlevel, location, loot) => {
  try {
    await query('INSERT INTO characters.kills (killer, killer_level, victim, victim_level, location, timestamp, looted) VALUES ($1, $2, $3, $4, $5, now(), $6);', [killer, klevel, victim, vlevel, location, loot]);
  } catch (e) {
    logger.error(e);
  }
};

const logPurge = async (payload) => {
  console.log('log purge');
  console.log(payload);
};


module.exports = {
  logMobKill,
  logPK,
  logPurge,
};
