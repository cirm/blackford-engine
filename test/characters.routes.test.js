const fetch = require('node-fetch');

const { server, headers } = require('./helpers/test.conf');
const { createTestUser } = require('./helpers/test.helpers');

let adminToken;

beforeAll(async () => {
  const body = { username: 'bakufu', password: 'EndOria' };
  adminToken = await fetch(`${server}/token`, { method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } }).then(res => res.json()).then(res => res.apiToken);
});

describe('routes: /characters', () => {
  test('generate user with budget', async () => {
    const authentication = await createTestUser(adminToken);
    const products = await fetch(`${server}/api/v1/decker/products`, { headers: { ...headers, authentication } }).then(res => res.json());
    expect(products[2].id).toEqual(3);
    expect(products[2].value).toEqual(1);
    const orders = await await fetch(`${server}/api/v1/decker/orders`, { headers: { ...headers, authentication } }).then(res => res.json());
    expect(orders).toHaveLength(0);
    const character = await fetch(`${server}/api/v1/decker/character`, { headers: { ...headers, authentication } }).then(res => res.json());
    expect(character.level).toEqual(1);
    const payment = await fetch(`${server}/api/v1/decker/products/3`, { method: 'POST', headers: { ...headers, authentication } }).then(res => res.json());
    expect(payment.status).toBeTruthy();
    const orders1 = await await fetch(`${server}/api/v1/decker/orders`, { headers: { ...headers, authentication } }).then(res => res.json());
    expect(orders1).toHaveLength(1);
    expect(orders1[0].upgrade_id).toEqual(3);
    const failedPayment = await fetch(`${server}/api/v1/decker/products/3`, { method: 'POST', headers: { ...headers, authentication } }).then(res => res.json());
    expect(failedPayment.status).toBeFalsy();
    const characterUp = await fetch(`${server}/api/v1/decker/character`, { headers: { ...headers, authentication } }).then(res => res.json());
    expect(characterUp.level).toEqual(2);
    expect(characterUp.wallet).toEqual(0);
  });
});