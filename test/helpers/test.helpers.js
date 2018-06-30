const fetch = require('node-fetch');
const Promise = require('bluebird');

const { server, headers } = require('./test.conf');

const createTestUser = async (adminToken) => {
  const { username } = await fetch(`${server}/api/v1/admin/users`, { method: 'POST', headers: { ...headers, authentication: adminToken } }).then(res => res.json());
  const body = { username, password: 'zeGermans' };
  const apiToken = await fetch(`${server}/token`, { method: 'POST', body: JSON.stringify(body), headers }).then(res => res.json()).then(res => res);
  console.log(apiToken.identity);
  return apiToken.apiToken;
};

const createTestUserWithId = async (adminToken) => {
  const { username } = await fetch(`${server}/api/v1/admin/users`, { method: 'POST', headers: { ...headers, authentication: adminToken } }).then(res => res.json());
  const body = { username, password: 'zeGermans' };
  const { id, apiToken } = await fetch(`${server}/token`, { method: 'POST', body: JSON.stringify(body), headers }).then(res => res.json());
  return { id, apiToken };
};
const sleep = (fn, ...args) => new Promise((resolve) => {
  setTimeout(() => resolve(fn(...args).then(res => res.json())), 2000);
});

const waitForBalance = async (authentication, balance) => {
  let { wallet } = await fetch(`${server}/api/v1/decker/character`, { headers: { ...headers, authentication } }).then(res => res.json());
  if (wallet !== balance) {
    const response = await sleep(fetch, `${server}/api/v1/decker/character`, { headers: { ...headers, authentication } });
    wallet = response.wallet;
  }
  return wallet;
};


module.exports = {
  createTestUser,
  createTestUserWithId,
  waitForBalance,
};
