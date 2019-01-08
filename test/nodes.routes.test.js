const { server, headers } = require('./helpers/test.conf');
const { createTestUserWithId, fetch } = require('./helpers/test.helpers');

describe('routes: /scan', () => {
  let adminToken;
  beforeAll(async () => {
    const body = { username: 'bakufu', password: 'EndOria' };
    adminToken = await fetch(`${server}/api/token`, { method: 'POST', body: JSON.stringify(body), headers }).then(res => res.apiToken);
  });

  test('Query all Nodes', async () => {
    const resp = await fetch(`${server}/api/v1/admin/nodes`, { headers: { ...headers, authentication: adminToken } });
    console.log(resp);
    expect(resp).toEqual([
      {
        id: 2, active: false, captured: false, level: 5,
      },
      {
        id: 3, active: true, captured: true, level: 5,
      },
      {
        id: 1, active: true, captured: true, level: 1,
      },
    ]);
  });

  test('Win a game', async () => {
    const testUser = await createTestUserWithId(adminToken);
    const body = { timestamp: new Date() };
    const resp = await fetch(`${server}/api/v1/decker/nodes/1`, { method: 'POST', headers: { ...headers, authentication: testUser.apiToken }, body: JSON.stringify(body) });
    console.log(resp);
    const secondResp = await fetch(`${server}/api/v1/admin/nodes`, { headers: { ...headers, authentication: adminToken } });
    console.log(secondResp);
  });
});
