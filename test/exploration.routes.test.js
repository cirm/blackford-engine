const fetch = require('node-fetch');

const server = 'http://localhost:4000';

describe('routes: /exploration', () => {
  let token;
  beforeAll(async () => {
    const body = { username: 'bakufu', password: 'EndOria' };
    token = await fetch(`${server}/token`, { method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } }).then(res => res.json()).then(res => res.apiToken);
  });

  test('Inittial exploration test', async () => {
    const response = await fetch(`${server}/api/v1/admin/exploration/`, { headers: { authentication: token } }).then(res => res.json());
    console.log(response);
  });

  test('Get Room history', async () => {
    const response = await fetch(`${server}/api/v1/decker/exploration/history`, { headers: { authentication: token } }).then(res => res.json());
    console.log(response);
  });
});

