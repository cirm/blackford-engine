const fetch = require('node-fetch');

const { server, headers } = require('./helpers/test.conf');
const { createTestUser, createTestUserWithId } = require('./helpers/test.helpers');

let adminToken;

beforeAll(async () => {
  const body = { username: 'bakufu', password: 'EndOria' };
  adminToken = await fetch(`${server}/token`, { method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } }).then(res => res.json()).then(res => res.apiToken);
});

describe('routes: /decker', () => {
  test('kill a mob', async () => {
    const authentication = await createTestUser(adminToken);
    await fetch(`${server}/api/v1/decker/exploration/zones/2`, { headers: { ...headers, authentication } }).then(res => res.json());
    const killConfirm = await fetch(`${server}/api/v1/decker/mob/1`, { headers: { ...headers, authentication } }).then(res => res.json());
    expect(killConfirm.status).toEqual('Nuked a mob');
    const balance = await fetch(`${server}/api/v1/decker/character`, { headers: { ...headers, authentication } }).then(res => res.json());
    expect(balance.wallet).toEqual(2000);
  });
  test('kill a player with looting', async () => {
    const authentication = await createTestUser(adminToken);
    const victim = await createTestUserWithId(adminToken);
    await fetch(`${server}/api/v1/decker/exploration/zones/2`, { headers: { ...headers, authentication } }).then(res => res.json());
    const killConfirm = await fetch(`${server}/api/v1/decker/ravage/${victim.id}`, { headers: { ...headers, authentication } }).then(res => res.json());
    expect(killConfirm.status).toEqual('Nuked a decker');
    const balance = await fetch(`${server}/api/v1/decker/character`, { headers: { ...headers, authentication } }).then(res => res.json());
    expect(balance.wallet).toEqual(1750);
    const vbalance = await fetch(`${server}/api/v1/decker/character`, { headers: { ...headers, authentication: victim.apiToken } }).then(res => res.json());
    expect(vbalance.wallet).toEqual(750);
  });
  test('kill a player without looting', async () => {
    const authentication = await createTestUser(adminToken);
    const victim = await createTestUserWithId(adminToken);
    await fetch(`${server}/api/v1/decker/exploration/zones/2`, { headers: { ...headers, authentication } }).then(res => res.json());
    const killConfirm = await fetch(`${server}/api/v1/decker/unplug/${victim.id}`, { headers: { ...headers, authentication } }).then(res => res.json());
    expect(killConfirm.status).toEqual('Nuked a decker');
    const balance = await fetch(`${server}/api/v1/decker/character`, { headers: { ...headers, authentication } }).then(res => res.json());
    expect(balance.wallet).toEqual(1500);
    const vbalance = await fetch(`${server}/api/v1/decker/character`, { headers: { ...headers, authentication: victim.apiToken } }).then(res => res.json());
    expect(vbalance.wallet).toEqual(1000);
  });
  test('purge a player', async () => {
    const victim = await createTestUserWithId(adminToken);
    await fetch(`${server}/api/v1/decker/exploration/zones/2`, { headers: { ...headers, authentication: victim.apiToken } }).then(res => res.json());
    const body = { id: 1, password: 'zegermans' };
    const killConfirm = await fetch(`${server}/api/v1/admin/purge/${victim.id}`, { method: 'POST', body: JSON.stringify(body), headers: { ...headers, authentication: adminToken } }).then(res => res.json());
    expect(killConfirm.status).toEqual('Decker purged from the system');
    const balance = await fetch(`${server}/api/v1/decker/character`, { headers: { ...headers, authentication: victim.apiToken } }).then(res => res.json());
    expect(balance.wallet).toEqual(1000);
  });
});
