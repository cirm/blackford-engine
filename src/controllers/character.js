const dbQuery = require('../db/decker');
const { handleUpgrade } = require('../db/upgrades');
const { asyncPipe } = require('../utilities/functional');

const ValidationError = (message, params, status = 401) => {
  const err = new Error(message);
  err.status = status;
  err.expose = 'Missing required params';
  if (params) { err.params = params; }
  throw err;
};

const getCharSheet = async (ctx) => {
  ctx.body = await dbQuery.getCharForUser(ctx.user.id);
};

const getProducts = async (ctx) => {
  ctx.body = await dbQuery.getProducts();
};

const getOrdersForUser = async (ctx) => {
  ctx.body = await dbQuery.getOrders(ctx.user.id);
};

const parseParametersFromRequest = ({ user, params }) => {
  if (!user || !params) return ValidationError('Missing required params');
  if (!user.id || !params.productId) return ValidationError('Missing required params');
  return { data: { decker: user.id, product: params.productId } };
};

const buyTheUpgrade = async ({ data, ...rest }) => {
  const result = await dbQuery.buyUpgradeForDecker(data.decker, data.product);
  return ({ ...rest, data, result });
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

const buyProduct1 = asyncPipe(
  parseParametersFromRequest,
  buyTheUpgrade,
  provisionUpgrade,
  formatResponse,
);

const buyProduct = async (ctx) => {
  ctx.body = await buyProduct1(ctx);
};

module.exports = {
  getCharSheet,
  getProducts,
  getOrdersForUser,
  buyProduct,
};
