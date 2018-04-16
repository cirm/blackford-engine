const Koa = require('koa');
const api = require('./api');
const config = require('./config');
const bodyParser = require('koa-bodyparser');
const morgan = require('koa-morgan');
const cors = require('kcors');
const logger = require('./utilities/winston');

// https://gist.github.com/LeverOne/1308368 :D
const uuid = function (a, b) { for (b = a = ''; a++ < 36; b += a * 51 & 52 ? (a ^ 15 ? 8 ^ Math.random() * (a ^ 20 ? 16 : 4) : 4).toString(16) : '-');return b; };

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

module.exports = app;
