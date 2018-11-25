const { server, headers } = require('./helpers/test.conf');
const { createTestUser, createTestUserWithId, fetch } = require('./helpers/test.helpers');

let adminToken;

beforeAll(async () => {
  const body = { username: 'bakufu', password: 'EndOria' };
  adminToken = await fetch(`${server}/token`, { method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } }).then(res => res.apiToken);
});

describe('routes: /characters', () => {
  test('generate user with budget', async () => {
    const authentication = await createTestUser(adminToken);
    const products = await fetch(`${server}/api/v1/decker/products`, { headers: { ...headers, authentication } });
    expect(products[2].id).toEqual(3);
    expect(products[2].value).toEqual(1);
    const orders = await await fetch(`${server}/api/v1/decker/orders`, { headers: { ...headers, authentication } });
    expect(orders).toHaveLength(0);
    const character = await fetch(`${server}/api/v1/decker/character`, { headers: { ...headers, authentication } });
    expect(character.level).toEqual(1);
    const payment = await fetch(`${server}/api/v1/decker/products/3`, { method: 'POST', headers: { ...headers, authentication } });
    expect(payment.status).toBeTruthy();
    const orders1 = await await fetch(`${server}/api/v1/decker/orders`, { headers: { ...headers, authentication } });
    expect(orders1).toHaveLength(1);
    expect(orders1[0].upgrade_id).toEqual(3);
    const failedPayment = await fetch(`${server}/api/v1/decker/products/3`, { method: 'POST', headers: { ...headers, authentication } });
    expect(failedPayment.status).toBeFalsy();
    const characterUp = await fetch(`${server}/api/v1/decker/character`, { headers: { ...headers, authentication } });
    expect(characterUp.level).toEqual(2);
    expect(characterUp.wallet).toEqual(0);
  });

  test('transfer money between players', async () => {
    const authentication = await createTestUser(adminToken);
    const { apiToken, id } = await createTestUserWithId(adminToken);
    const payment = await fetch(`${server}/api/v1/decker/payments/`, { method: 'POST', headers: { ...headers, authentication }, body: JSON.stringify({ ammount: 1000, recipient: id }) });
    expect(payment).toEqual({ status: 'Payment Successful' });
    const sender = await fetch(`${server}/api/v1/decker/character`, { headers: { ...headers, authentication } });
    const receiver = await fetch(`${server}/api/v1/decker/character`, { headers: { ...headers, authentication: apiToken } });
    expect(sender.wallet).toEqual(0);
    expect(receiver.wallet).toEqual(2000);
  });

  test('transfer money not enough money', async () => {
    const authentication = await createTestUser(adminToken);
    const { apiToken, id } = await createTestUserWithId(adminToken);
    const payment = await fetch(`${server}/api/v1/decker/payments/`, { method: 'POST', headers: { ...headers, authentication }, body: JSON.stringify({ ammount: 1001, recipient: id }) });
    expect(payment).toEqual({ error: 'Failed to change Balance', status: 401 });
    const sender = await fetch(`${server}/api/v1/decker/character`, { headers: { ...headers, authentication } });
    const receiver = await fetch(`${server}/api/v1/decker/character`, { headers: { ...headers, authentication: apiToken } });
    expect(sender.wallet).toEqual(1000);
    expect(receiver.wallet).toEqual(1000);
  });
  test('transfer money - negative money', async () => {
    const authentication = await createTestUser(adminToken);
    const { apiToken, id } = await createTestUserWithId(adminToken);
    const payment = await fetch(`${server}/api/v1/decker/payments/`, { method: 'POST', headers: { ...headers, authentication }, body: JSON.stringify({ ammount: -1001, recipient: id }) });
    expect(payment).toEqual({ error: 'Failed to change Balance', status: 401 });
    const sender = await fetch(`${server}/api/v1/decker/character`, { headers: { ...headers, authentication } });
    const receiver = await fetch(`${server}/api/v1/decker/character`, { headers: { ...headers, authentication: apiToken } });
    expect(sender.wallet).toEqual(1000);
    expect(receiver.wallet).toEqual(1000);
  });
  test('transfer money - undefined money', async () => {
    const authentication = await createTestUser(adminToken);
    const { apiToken, id } = await createTestUserWithId(adminToken);
    const payment = await fetch(`${server}/api/v1/decker/payments/`, { method: 'POST', headers: { ...headers, authentication }, body: JSON.stringify({ ammount: undefined, recipient: id }) });
    expect(payment).toEqual({ error: 'Missing required params', status: 401 });
    const sender = await fetch(`${server}/api/v1/decker/character`, { headers: { ...headers, authentication } });
    const receiver = await fetch(`${server}/api/v1/decker/character`, { headers: { ...headers, authentication: apiToken } });
    expect(sender.wallet).toEqual(1000);
    expect(receiver.wallet).toEqual(1000);
  });
  test('transfer money - formattable money', async () => {
    const authentication = await createTestUser(adminToken);
    const { apiToken, id } = await createTestUserWithId(adminToken);
    const payment = await fetch(`${server}/api/v1/decker/payments/`, { method: 'POST', headers: { ...headers, authentication }, body: JSON.stringify({ ammount: '12.34', recipient: id }) });
    expect(payment).toEqual({ status: 'Payment Successful' });
    const sender = await fetch(`${server}/api/v1/decker/character`, { headers: { ...headers, authentication } });
    const receiver = await fetch(`${server}/api/v1/decker/character`, { headers: { ...headers, authentication: apiToken } });
    expect(sender.wallet).toEqual(988);
    expect(receiver.wallet).toEqual(1012);
  });
});
