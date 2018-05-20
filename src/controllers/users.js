const db = require('../db');
const dbQuery = require('../db/admin');
const bcrypt = require('../utilities/bcrypt');

const getAllUsers = async (ctx, next) => {
  const users = await db.query('SELECT dp.id, dp.username, dp.visited, array_agg(dr.name) AS roles FROM decker.players dp, decker.roles dr, decker.player_roles dpr WHERE dp.id = dpr.player_id and dpr.role_id = dr.id GROUP BY dp.username, dp.visited, dp.id');
  ctx.body = users.rows;
  return next();
};

const createUser = async (ctx, next) => {
  const username = ctx.request.body.user
    ? ctx.request.body.user
    : `test_user_${Math.floor(Math.random() * 8999) + 1000}`;
  const password = ctx.request.body.user
    ? await bcrypt.hashpassword(ctx.request.body.password)
    : '$2a$11$wUwXkDTesHKL4iz6C8aycuEJ9PpeawmhOY2yfMWNu0CWnKA/y/qVG'; // zeGermans

  const resp = await dbQuery.createUser(username, password);
  ctx.body = {
    ...resp,
    username,
  };
  return next();
};

const addBudget = async (ctx, next) => {
  const userId = ctx.params.id;
  const ammount = ctx.params.ammount || 10000;
  const resp = await dbQuery.provisionBudget(userId, ammount);
  ctx.body = {
    ...resp,
  };
  return next();
};

module.exports = {
  getAllUsers,
  createUser,
  addBudget,
};
