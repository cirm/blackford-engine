const db = require('../db');

const getAllUsers = async (ctx, next) => {
  const users = await db.query('select dp.id, dp.username, dp.visited, array_agg(dr.name) as roles from decker.players dp, decker.roles dr, decker.player_roles dpr where dp.id = dpr.player_id and dpr.role_id = dr.id GROUP BY dp.username, dp.visited, dp.id');
  ctx.body = users.rows;
};

module.exports = {
  getAllUsers,
};
