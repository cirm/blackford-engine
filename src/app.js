const Koa = require('koa');
const api = require('./api');
const config = require('./config');
const bodyParser = require('koa-bodyparser');
const morgan = require('koa-morgan');
const cors = require('kcors');
const logger = require('./utilities/winston');


const app = new Koa()
  .use(morgan('dev', {
    stream: logger.stream,
  }))
  .use(async (ctx, next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    ctx.set('X-Response-Time', `${ms}ms`);
  })
  .use(cors())
  .use(bodyParser())
  .use(api.routes())
  .use(api.allowedMethods());

module.exports = app;
