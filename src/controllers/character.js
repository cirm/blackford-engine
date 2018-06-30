const dbQuery = require('../db/decker');
const logger = require('../utilities/winston');
const { handleUpgrade } = require('../db/upgrades');
const { asyncPipe } = require('../utilities/functional');

const getCharSheet = async (ctx, next) => {
  ctx.body = await dbQuery.getCharForUser(ctx.user.id);
  return next();
};

const getProducts = async (ctx, next) => {
  ctx.body = await dbQuery.getProducts();
  return next();
};

const getOrdersForUser = async (ctx, next) => {
  ctx.body = await dbQuery.getOrders(ctx.user.id);
  return next();
};

const parseParametersFromRequest = ({ user, params }) => {
  if (!user || !params) throw new Error('Missing required params');
  if (!user.id || !params.productId) throw new Error('Missing required params');
  return { data: { decker: user.id, product: params.productId } };
};

const buyTheUpgrade = async (payload) => {
  const result = await dbQuery.buyUpgradeForDecker(payload.data.decker, payload.data.product);
  return ({ ...payload, result });
};

const provisionUpgrade = async (payload) => {
  if (payload.result.status) {
    await handleUpgrade(payload.data.decker, payload.result.upgrade_type, payload.result.order_id);
  }
  return payload;
};

const formatResponse = ({ result }) => ({
  text: result.text,
  status: result.status,
  orderId: result.order_id,
});

const buyProduct1 = asyncPipe(
  parseParametersFromRequest,
  buyTheUpgrade,
  provisionUpgrade,
  formatResponse,
);

const buyProduct = async (ctx, next) => {
  try {
    ctx.body = await buyProduct1(ctx);
  } catch (e) {
    logger.error(e);
    ctx.body = 'Payment Failure';
  }
  return next();
};

module.exports = {
  getCharSheet,
  getProducts,
  getOrdersForUser,
  buyProduct,
};
