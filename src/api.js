const KoaRouter = require('koa-router');
const users = require('./controllers/users');
const authentication = require('./controllers/authentication');
const exploration = require('./controllers/exploration');

const api = KoaRouter();
api
  .use('/api', authentication.userAuth)
  .use('/api/v1/admin', authentication.checkAdmin)
  .use('/api/v1/decker', authentication.checkDecker)
  .use('/api/v1/montor', authentication.checkMonitor)

  .post('/token', authentication.getTokens) // get chatToken
  .put('/token', authentication.renewToken) // renew chatToken
  .post('/gameToken', authentication.getGameToken) // get mobile token


  .get('/api/v1/admin/users', users.getAllUsers)

  .get('/api/v1/decker/exploration/:id', exploration.enterRoom)

  .get('/api/v1/decker/nodes/:nodeId')
  .post('/api/v1/decker/nodes/:nodeId')
  .get('/api/v1/decker/players/:playerId')
  .post('/api/v1/decker/players/:playerId')
  .post('/api/v1/decker/payments/')
  .get('/api/v1/monitor/gameState');

module.exports = api;
