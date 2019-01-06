const KoaRouter = require('koa-router');
const users = require('./controllers/users');
const authentication = require('./controllers/authentication');
const exploration = require('./controllers/exploration');
const decker = require('./controllers/decker');
const character = require('./controllers/character');
const scan = require('./controllers/scan');
const nodes = require('./controllers/nodes');
const routeAuth = require('./controllers/routeAuth');

const api = KoaRouter();
api
  .use('/api/v1', routeAuth.userAuth)
  .use('/api/v1/admin', routeAuth.checkAdmin)
  .use('/api/v1/decker', routeAuth.checkDecker)
  .use('/api/v1/montor', routeAuth.checkMonitor)

  .post('/api/token', authentication.getTokens) // get chatToken
  .put('/api/token', authentication.renewToken) // renew chatToken
  .post('/api/gameToken', authentication.getGameToken) // get mobile token


  .get('/api/v1/admin/users', users.getAllUsers)
  .post('/api/v1/admin/users/', users.createUser)
  .post('/api/v1/admin/users/:id/wallet/:ammount', users.addBudget)

  .get('/api/v1/admin/exploration', exploration.getRooms)
  .get('/api/v1/admin/exploration/timeouts', exploration.getLaggingDeckers)

  .get('/api/v1/decker/exploration/history/', exploration.getRoomHistoryForPlayer)
  .get('/api/v1/decker/exploration/zones/:id', exploration.enterRoom)

  .get('/api/v1/decker/scan/:type/:id', scan.readItem) // scan something
  .get('/api/v1/decker/unplug/:playerId', decker.nukeDecker) // kill player
  .get('/api/v1/decker/mob/:mobId', decker.nukeMob) // kill & loot mob
  .get('/api/v1/decker/ravage/:playerId', decker.ravageDecker) // kill player & loot

  .post('/api/v1/admin/purge/:deckerId', decker.purgeDecker) // mob kills decker


  .get('/api/v1/admin/nodes/', nodes.getAllNodes)
  .get('/api/v1/admin/nodeStatus/', nodes.getNodeStatus)
  .get('/api/v1/admin/nodes/:nodeId', nodes.getNodeHistory)

  .post('/api/v1/decker/nodes/:nodeId', nodes.captureNode) // hack node


  .get('/api/v1/decker/products', character.getProducts) // get all products
  .get('/api/v1/decker/orders', character.getOrdersForUser) // get characters orders
  .post('/api/v1/decker/products/:productId', character.buyProduct) // buy product
  .get('/api/v1/decker/character', character.getCharSheet) // get charsheet & stats

  .post('/api/v1/decker/payments/', character.sendMoney) // transfer money

  .get('/api/v1/monitor/gameState');

module.exports = api;
