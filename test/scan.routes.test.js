const { server, headers } = require('./helpers/test.conf');
const { createTestUser, fetch } = require('./helpers/test.helpers');

describe('routes: /scan', () => {
  let adminToken;
  beforeAll(async () => {
    const body = { username: 'bakufu', password: 'EndOria' };
    adminToken = await fetch(`${server}/api/token`, { method: 'POST', body: JSON.stringify(body), headers }).then(res => res.apiToken);
  });

  test('Scan player', async () => {
    const authentication = await createTestUser(adminToken);
    const response = await fetch(`${server}/api/v1/decker/scan/player/1`, { headers: { authentication } });
    expect(response).toEqual({
      decker: 'bakufu', humanity: 10, level: 1, misc: { bio: 'TBD' },
    });
  });
  test('scan mob', async () => {
    const authentication = await createTestUser(adminToken);
    const response = await fetch(`${server}/api/v1/decker/scan/mob/3`, { headers: { authentication } });
    expect(response).toEqual({ bounty: 8000, level: 3, meta: 'Bakufu has arrived' });
  });

  test('scan node', async () => {
    const authentication = await createTestUser(adminToken);
    const response = await fetch(`${server}/api/v1/decker/scan/node/3`, { headers: { authentication } });
    expect(response).toEqual({ active: true, captured: '2019-01-06T08:54:10.934Z', owner: 'bakufu' });
  });

  test('scan object', async () => {
    const authentication = await createTestUser(adminToken);
    const response = await fetch(`${server}/api/v1/decker/scan/item/3`, { headers: { authentication } });
    expect(response).toEqual({ meta: 'a big box', type: 'movable' });
  });
});
