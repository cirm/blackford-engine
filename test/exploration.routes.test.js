const fetch = require('node-fetch');

const { server, headers } = require('./helpers/test.conf');
const { createTestUser } = require('./helpers/test.helpers');

describe('routes: /exploration', () => {
  let adminToken;
  beforeAll(async () => {
    const body = { username: 'bakufu', password: 'EndOria' };
    adminToken = await fetch(`${server}/token`, { method: 'POST', body: JSON.stringify(body), headers }).then(res => res.json()).then(res => res.apiToken);
  });

  test('Inittial exploration test', async () => {
    const response = await fetch(`${server}/api/v1/admin/exploration/`, { headers: { authentication: adminToken } }).then(res => res.json());
    console.log(response);
  });

  test('Get Room history', async () => {
    const authentication = await createTestUser(adminToken);
    const response = await fetch(`${server}/api/v1/decker/exploration/history`, { headers: { authentication } }).then(res => res.json());
    console.log(response);
  });

  test('Enter room timeout', async () => {
    const authentication = await createTestUser(adminToken);
    await fetch(`${server}/api/v1/decker/exploration/zones/5`, { headers: { ...headers, authentication } }).then(res => res.json());
  });
});

