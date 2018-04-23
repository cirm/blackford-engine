const server = require('../index');
const request = require('supertest');

describe('routes: /exploration', () => {
  let token;
  beforeAll(async () => {
    const response = await request(server.callback()).post('/token').send({ username: 'bakufu', password: 'EndOria' });
    token = response.body.apiToken;
  });

  test('Inittial exploration test', async () => {
    const response = await request(server.callback()).get('/api/v1/admin/exploration/').set('authentication', token);
  });

  test('Get Room history', async () => {
    const response = await request(server.callback()).get('/api/v1/decker/exploration/history').set('authentication', token);
    // expect(response.body).toHaveProperty('rooms');
    console.log(response.body);
  });
});

