const Promise = require('bluebird');
const { queryNodes, queryNodeCapturedHistory, queryCapturedStatus } = require('../db/node');
const logger = require('../utilities/winston');
const {
  all, first,
} = require('../db');

const errorResponse = async (ctx, reason) => {
  ctx.status = 401;
  ctx.body = {
    statusCode: 401,
    error: 'Unauthorized',
    message: reason,
  };
  //  await mq.sendToQueue(eventQueue, {
  //  requestId: ctx.req.headers['x-blackford-request-id'], deckerId: ctx.user.id, roomId: ctx.params.id, timestamp: new Date(), timeout: 0, event: 'rejection',
  // });
  return ctx;
};

const getAllNodes = async (ctx) => {
  const resp = await ctx.db.query(queryNodes).then(all);
  ctx.body = resp;
};

const getNodeHistory = async (ctx) => {
  ctx.body = await ctx.db.query(queryNodeCapturedHistory, [ctx.params.nodeId]).then(all);
};

const getNodeStatus = async (ctx) => {
  ctx.body = await ctx.db.query(queryCapturedStatus).then(all);
};

const captureNode = async (ctx) => {
  const nodeId = ctx.params.nodeId;
  const timestamp = ctx.request.body.timestamp;
  console.log('booooo');
  console.log(ctx.params.nodeId);
  console.log(ctx.request.body);
  // check if node in node list
  if (!new Date(timestamp).getTime() > 0) {
    return (errorResponse(ctx, 'Strange timestamp...'));
  } if (new Date().getTime() - timestamp > 30000) { // 30 sec in past
    return errorResponse(ctx, 'Strange request');
  } if (new Date().getTime() - timestamp < 10000) { // 10 sec in future
    return errorResponse(ctx, 'Strange request');
  }
  // check is self-claim
  const resp = await Promise.all([
    ctx.db.query('select active from game.nodes where id = $1;', [nodeId]).then(first),
    ctx.db.query('select owner, captured from game.node_status_events where node_id = $1 order by captured limit 1;', [nodeId]).then(first),
  ]);
  if (!resp[0].active) {
    ctx.body = { status: 'Not so good!' };
    return errorResponse(ctx, 'Node is still locked');
  }
  if (resp[1] && resp[1].owner === ctx.user.id) {
    ctx.body = { status: 'Recapture bah!' };
    return errorResponse(ctx, 'You own the node already');
  }
  try {
    await ctx.db.transaction(
      ['UPDATE game.nodes SET captured = true WHERE id = $1;', [nodeId]],
      ['INSERT INTO game.node_status_events (node_id, owner, captured) VALUES ($1, $2, $3);', [nodeId, ctx.user.id, new Date(timestamp)]],
    );
  } catch (e) {
    logger.error(e);
    BalanceError('Transaction failed');
  }
  // claim node
  console.log('whee');
  ctx.body = { status: 'Captured node!' };
};

module.exports = {
  getAllNodes, captureNode, getNodeHistory, getNodeStatus,
};
