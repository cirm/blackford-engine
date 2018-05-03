const request = require('supertest');
const proxyquire = require('proxyquire');
const ampqlib = require('amqplib-mocks');

const server = proxyquire('../index', { ampqlib });

let adminToken;

beforeAll(async () => {
  const { body } = await request(server.callback()).post('/token').send({ username: 'bakufu', password: 'EndOria' });
  adminToken = body.apiToken;
});

describe('routes: /token', () => {
  test('generate user with budget', async () => {
    const { body } = await request(server.callback()).post('/api/v1/admin/users/').set('authentication', adminToken);
    const response = await request(server.callback()).post('/token').send({ username: body.username, password: 'zeGermans' });
    const products = await request(server.callback()).get('/api/v1/decker/products').set('authentication', response.body.apiToken);
    console.log(products.body);
    const orders = await request(server.callback()).get('/api/v1/decker/orders').set('authentication', response.body.apiToken);
    console.log(orders.body);
    const character = await request(server.callback()).get('/api/v1/decker/character').set('authentication', response.body.apiToken);
    console.log(character.body);
    const payment = await request(server.callback()).post('/api/v1/decker/products/3').set('authentication', response.body.apiToken);
    console.log(payment.body);
  });
});
