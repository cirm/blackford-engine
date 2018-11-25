const { server, headers } = require('./helpers/test.conf');
const { createTestUser, fetch } = require('./helpers/test.helpers');

describe('routes: /scan', () => {
  let adminToken;
  beforeAll(async () => {
    const body = { username: 'bakufu', password: 'EndOria' };
    adminToken = await fetch(`${server}/token`, { method: 'POST', body: JSON.stringify(body), headers }).then(res => res.apiToken);
  });

  test('Query all Nodes', async () => {
    const resp = await fetch(`${server}/api/v1/admin/nodes`, { headers: { ...headers, authentication: adminToken } });
    expect(resp.map(node => ({ id: node.id, level: node.level }))).toEqual([{
      id: 1, level: 1,
    }, {
      id: 2, level: 5,
    }, {
      id: 3, level: 5,
    }]);
  });
  test('Win a game', async () => {
    const authentication = await createTestUser(adminToken);
    const resp = await fetch(`${server}/api/v1/decker/nodes/1`, { headers: { ...headers, authentication } });
    console.log(resp);
  });
  test('Loose a game', async () => {
    const authentication = await createTestUser(adminToken);
    const resp = await fetch(`${server}/api/v1/decker/nodes/1`, { headers: { ...headers, authentication } });
    console.log(resp);
  });
});
