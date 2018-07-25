// @flow
const dbQuery = require('../db/decker');
const {
  all, first,
} = require('../db');
const {
  handleUpgrade,
} = require('../db/upgrades');
const { asyncPipe } = require('../utilities/functional');
const logger = require('../utilities/winston');

const ValidationError = (message, params, status = 401) => {
  const err = new Error(message);
  err.status = status;
  err.expose = 'Missing required params';
  if (params) { err.params = params; }
  throw err;
};

const BalanceError = (message, params, status = 401) => {
  const err = new Error(message);
  err.status = status;
  err.expose = 'Failed to change Balance';
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

const sendMoney = async (ctx) => {
  const { ammount, recipient } = ctx.request.body;
  const { wallet } = await ctx.db.query(dbQuery.getCharForUser, [ctx.user.id]).then(first);
  if (wallet < ammount) BalanceError('Not enough Balance');
  if (ammount < 1) BalanceError('No negative transfers');
  try {
    ctx.db.transaction(
      ['UPDATE characters.deckers SET wallet = wallet -$2 WHERE id = $1;', [ctx.user.id, ammount]],
      ['UPDATE characters.deckers SET wallet = wallet +$2 WHERE id = $1;', [recipient, ammount]],
    );
  } catch (e) {
    BalanceError('Transaction failed');
  }
  ctx.body = { status: 'Payment Successful' };
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
  sendMoney,
};
