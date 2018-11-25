const { queryNodes } = require('../db/node');
const { query, all } = require('../db');

const getAllNodes = async (ctx, next) => {
  const nodeId = ctx.params.nodeId;
  const resp = await query(queryNodes, nodeId).then(all);
  ctx.body = resp;
};

const captureNode = async (ctx, next) => {
  console.log('booooo');
  console.log(ctx.params.nodeId);
  console.log('whee');
  ctx.body = { status: 'Metal heavy!' };
};

module.exports = { getAllNodes, captureNode };
