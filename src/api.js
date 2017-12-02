const KoaRouter = require('koa-router');
const users = require('./controllers/users');
const authentication = require('./controllers/authentication');

const api = KoaRouter();

api
  .get('/token', (ctx, next) => {
    ctx.body = 'fuck yeah';
  })
  .post('/token', authentication.getTokens)
  .get('/users', users.getAllUsers);

module.exports = api;
