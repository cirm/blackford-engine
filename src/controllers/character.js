const dbQuery = require('../db/decker');
const mq = require('../mq/index');

const eventQueue = 'orders';

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

