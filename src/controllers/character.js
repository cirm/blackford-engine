// @flow
const dbQuery = require('../db/decker');
const {
  all, first,
} = require('../db');
const {
  handleUpgrade,
} = require('../db/upgrades');
const { asyncPipe } = require('../utilities/functional');

const ValidationError = (message, params, status = 401) => {
  const err = new Error(message);
  err.status = status;
  err.expose = 'Missing required params';
  if (params) { err.params = params; }
  throw err;
};

const getCharSheet = async (ctx) => {
  ctx.body = await ctx.db.query(dbQuery.getCharForUser, [ctx.user.id]).then(first);
};

const getProducts = async (ctx) => {
  ctx.body = await ctx.db.query(dbQuery.getProducts).then(all);
};

const getOrdersForUser = async (ctx) => {
  ctx.body = await ctx.db.query(dbQuery.getOrders, [ctx.user.id]).then(all);
};

const parseParametersFromRequest = ({ user, params, db }) => {
  if (!user || !params) return ValidationError('Missing required params');
  if (!user.id || !params.productId) return ValidationError('Missing required params');
  return { data: { decker: user.id, product: params.productId }, db };
};

const buyTheUpgrade = async ({ data, db, ...rest }) => {
  const result = await db.query(dbQuery.buyUpgradeForDecker, [data.decker, data.product])
    .then(first);
  return ({
    ...rest, data, result, db,
  });
};

const provisionUpgrade = async ({ result, data, ...rest }) => {
  if (result.status) {
    await handleUpgrade(data.decker, result.upgrade_type, result.order_id);
  }
  return { result, data, ...rest };
};

const formatResponse = ({ result }) => ({
  text: result.text,
  status: result.status,
  orderId: result.order_id,
});

const composedBuyProduct = asyncPipe(
  parseParametersFromRequest,
  buyTheUpgrade,
  provisionUpgrade,
  formatResponse,
);

const buyProduct = async (ctx) => {
  ctx.body = await composedBuyProduct(ctx);
};

module.exports = {
  getCharSheet,
  getProducts,
  getOrdersForUser,
  buyProduct,
};
