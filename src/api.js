const KoaRouter = require('koa-router');
const users = require('./controllers/users');
const authentication = require('./controllers/authentication');
const exploration = require('./controllers/exploration');
const character = require('./controllers/character');
const scan = require('./controllers/scan');

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
  .post('/api/v1/admin/users/', users.createUser)
  .post('/api/v1/admin/users/:id/wallet/:ammount', users.addBudget)

  .get('/api/v1/admin/exploration', exploration.getRooms)
  .get('/api/v1/admin/exploration/timeouts', exploration.getLaggingDeckers)

  .get('/api/v1/decker/exploration/history/', exploration.getRoomHistoryForPlayer)
  .get('/api/v1/decker/exploration/zones/:id', exploration.enterRoom)

  .get('/api/v1/decker/scan/:type/:id', scan.readItem) // scan something
  .post('/api/v1/decker/players/unplug/:playerId') // kill player & loot
  .post('/api/v1/decker/nodes/:nodeId') // hack node
  .post('/api/v1/decker/mob/:mobId') // kill & loot mob

  .get('/api/v1/decker/products', character.getProducts) // get all products
  .get('/api/v1/decker/orders', character.getOrdersForUser) // get characters orders
  .post('/api/v1/decker/products/:productId', character.buyProduct) // buy product
  .get('/api/v1/decker/character', character.getCharSheet) // get charsheet & stats

  .post('/api/v1/decker/payments/')

  .get('/api/v1/monitor/gameState');

module.exports = api;
