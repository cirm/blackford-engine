const dbquery = require('../db/decker');
const mq = require('../mq/index');
const Promise = require('bluebird');

const eventQueue = 'exploration';

const errorResponse = async (ctx, reason) => {
  ctx.status = 401;
  ctx.body = {
    statusCode: 401,
    error: 'Unauthorized',
    message: reason,
  };
  await mq.sendToQueue(eventQueue, {
    requestId: ctx.req.headers['x-blackford-request-id'], deckerId: ctx.user.id, roomId: ctx.params.id, timestamp: new Date(), timeout: 0, event: 'rejection',
  });
  return ctx;
};

const enterRoom = async (ctx, next) => {
  const entryZone = ctx.params.id;
  const queries = await Promise.all([
    dbquery.getPlayer(ctx.user.id),
    dbquery.getZoneInfo(entryZone),
    dbquery.getPlayersCurrentZone(ctx.user.id)]);

  const player = queries[0];
  const zone = queries[1];
  const currentZone = queries[2];

  if (currentZone.zone_id.toString() === entryZone) {
    ctx.body = { status: 'Entry granted', entry: currentZone.entry, timeout: new Date(new Date(currentZone.entry).getTime() + (zone.timeout * 1000)) };
    return next();
  }
  if (!zone.isOpen) {
    return errorResponse(ctx, 'Zone is closed off for decontamination!');
  }
  if (player.level < zone.level) {
    return errorResponse(ctx, 'Get serious kid, do you have a deathwish? Get some more exp!');
  }
  const canFit = await dbquery.isZoneCapOpen(ctx.params.id, zone.cap);
  if (!canFit) {
    return errorResponse(ctx, 'Too slow, zone if full!');
  }

  const timestamp = new Date();
  const payload = [ctx.user.id, ctx.params.id, timestamp];
  await dbquery.enterRoom(...payload);
  await mq.sendToQueue(eventQueue, {
    requestId: ctx.req.headers['x-blackford-request-id'], deckerId: ctx.user.id, roomId: ctx.params.id, timestamp, timeout: zone.timeout, event: 'enteroom',
  });
  ctx.body = { status: 'Entry granted', entry: timestamp, timeout: new Date(timestamp.getTime() + (zone.timeout * 1000)) };
  return next();
};


module.exports = {
  enterRoom,
};
