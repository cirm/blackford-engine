const { query, all } = require('../db');
const dbQuery = require('../db/admin');
const bcrypt = require('../utilities/bcrypt');

const getAllUsers = async (ctx) => {
  ctx.body = await query('SELECT dp.id, dp.decker, array_agg(dr.name) AS roles FROM characters.deckers dp, account.roles dr, account.player_roles dpr WHERE dp.id = dpr.account_id and dpr.role_id = dr.id GROUP BY dp.decker, dp.id').then(all);
};

const createUser = async (ctx) => {
  const username = ctx.request.body.user
    ? ctx.request.body.user
    : `decker_${Math.floor(Math.random() * 899) + 100}_${Date.now()}`;
  const password = ctx.request.body.user
    ? await bcrypt.hashpassword(ctx.request.body.password)
    : '$2a$11$wUwXkDTesHKL4iz6C8aycuEJ9PpeawmhOY2yfMWNu0CWnKA/y/qVG'; // zeGermans

  const resp = await dbQuery.createUser(username, password);
  ctx.body = {
    ...resp,
    username,
  };
};

const addBudget = async (ctx) => {
  const userId = ctx.params.id;
  const ammount = ctx.params.ammount || 10000;
  const resp = await dbQuery.provisionBudget(userId, ammount);
  ctx.body = {
    ...resp,
  };
};

module.exports = {
  getAllUsers,
  createUser,
  addBudget,
};
