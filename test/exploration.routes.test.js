const { server, headers } = require('./helpers/test.conf');
const { createTestUser, fetch } = require('./helpers/test.helpers');

describe('routes: /exploration', () => {
  let adminToken;
  beforeAll(async () => {
    const body = { username: 'bakufu', password: 'EndOria' };
    adminToken = await fetch(`${server}/api/token`, { method: 'POST', body: JSON.stringify(body), headers }).then(res => res.apiToken);
  });

  test('Inittial exploration test', async () => {
    const response = await fetch(`${server}/api/v1/admin/exploration/`, { headers: { authentication: adminToken } });
    console.log(response);
  });

  test('Get Room history', async () => {
    const authentication = await createTestUser(adminToken);
    const response = await fetch(`${server}/api/v1/decker/exploration/history`, { headers: { authentication } });
    console.log(response);
  });

  test('Enter room timeout', async () => {
    const authentication = await createTestUser(adminToken);
    await fetch(`${server}/api/v1/decker/exploration/zones/5`, { headers: { ...headers, authentication } });
  });
});
