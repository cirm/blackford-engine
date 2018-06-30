const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const morgan = require('koa-morgan');
const cors = require('kcors');
const config = require('./config');
const db = require('./db');
const api = require('./api');
const logger = require('./utilities/winston');

// https://gist.github.com/LeverOne/1308368 :D
const uuid = function (a, b) { for (b = a = ''; a++ < 36; b += a * 51 & 52 ? (a ^ 15 ? 8 ^ Math.random() * (a ^ 20 ? 16 : 4) : 4).toString(16) : '-');return b; };

const errorHandler = async (ctx, next) => {
  try {
    await next();
  } catch (e) {
    ctx.status = e.status || 500;
    ctx.body = e.expose ? { error: e.expose, status: e.status } : { error: 'Internal Server Error', status: ctx.status };
    ctx.app.emit('error', e, ctx);
  }
};

const app = new Koa()
  .use(morgan(config.loggerFormat, {
    stream: logger.stream,
  }))
  .use(async (ctx, next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    ctx.set('X-Response-Time', `${ms}ms`);
  })
  .use(errorHandler)
  .use((ctx, next) => {
    const headerKey = 'x-blackford-request-id';
    if (!ctx.req.headers[headerKey]) {
      ctx.set(headerKey, uuid());
      return next();
    }
    ctx.set(headerKey, ctx.req.headers[headerKey]);
    return next();
  })
  .use(cors())
  .use(bodyParser())
  .use(api.routes())
  .use(api.allowedMethods());

app.context.db = db;
app.on('error', (err, ctx) => {
  if (!err.status || err.status === 500) {
    logger.error(err.stack);
  } else {
    logger.info(err.message);
  }
});

module.exports = app;
