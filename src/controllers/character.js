const dbQuery = require('../db/decker');
const mq = require('../mq/index');

const eventQueue = 'orders';

const getCharSheet = async (ctx, next) => {
  const char = await dbQuery.getCharForUser(ctx.user.id);
  ctx.body = char;
  return next();
};

const getProducts = async (ctx, next) => {
  const products = await dbQuery.getProducts();
  ctx.body = products;
  return next();
};

const getOrdersForUser = async (ctx, next) => {
  const orders = await dbQuery.getOrders(ctx.user.id);
  ctx.body = orders;
  return next();
};

const buyProduct = async (ctx, next) => {
  const result = await dbQuery.buyUpgradeForDecker(ctx.user.id, ctx.params.productId);
  if (result.status) {
    await mq.sendToQueue(eventQueue, {
      requestId: ctx.req.headers['x-blackford-request-id'], deckerId: ctx.user.id, orderId: result.order_id, product: ctx.params.productId, timestamp: new Date(), event: 'provision',
    });
  }
  ctx.body = result;
  return next();
};

module.exports = {
  getCharSheet,
  getProducts,
  getOrdersForUser,
  buyProduct,
};

