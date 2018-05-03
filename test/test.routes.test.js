const fetch = require('node-fetch');

const server = 'http://localhost:4000';

let adminToken;

beforeAll(async () => {
  const body = { username: 'bakufu', password: 'EndOria' };
  adminToken = await fetch(`${server}/token`, { method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } }).then(res => res.json()).then(res => res.apiToken);
});

describe('routes: /token', () => {
  test('generate user with budget', async () => {
    const { username } = await fetch(`${server}/api/v1/admin/users`, { method: 'POST', headers: { 'Content-Type': 'application/json', authentication: adminToken } }).then(res => res.json());
    const body = { username, password: 'zeGermans' };
    const apiToken = await fetch(`${server}/token`, { method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } }).then(res => res.json()).then(res => res.apiToken);
    const products = await fetch(`${server}/api/v1/decker/products`, { headers: { 'Content-Type': 'application/json', authentication: apiToken } }).then(res => res.json());
    console.log(products);
    const orders = await await fetch(`${server}/api/v1/decker/orders`, { headers: { 'Content-Type': 'application/json', authentication: apiToken } }).then(res => res.json());
    console.log(orders);
    const character = await fetch(`${server}/api/v1/decker/character`, { headers: { 'Content-Type': 'application/json', authentication: apiToken } }).then(res => res.json());
    console.log(character);
    const payment = await fetch(`${server}/api/v1/decker/products/3`, { method: 'POST', headers: { 'Content-Type': 'application/json', authentication: apiToken } }).then(res => res.json());
    console.log(payment);
    const orders1 = await await fetch(`${server}/api/v1/decker/orders`, { headers: { 'Content-Type': 'application/json', authentication: apiToken } }).then(res => res.json());
    console.log(orders1);
  });
});
