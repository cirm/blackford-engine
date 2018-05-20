const fetch = require('node-fetch');

const { server, headers } = require('./helpers/test.conf');
const { createTestUser } = require('./helpers/test.helpers');

describe('routes: /scan', () => {
  let adminToken;
  beforeAll(async () => {
    const body = { username: 'bakufu', password: 'EndOria' };
    adminToken = await fetch(`${server}/token`, { method: 'POST', body: JSON.stringify(body), headers }).then(res => res.json()).then(res => res.apiToken);
  });

  test('Scan player', async () => {
    const authentication = await createTestUser(adminToken);
    const response = await fetch(`${server}/api/v1/decker/scan/player/1`, { headers: { authentication } }).then(res => res.json());
    expect(response).toEqual({
      decker: 'bakufu', humanity: 9, level: 6, misc: { bio: 'TBD' },
    });
  });
});

