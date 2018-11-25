const rawFetch = require('node-fetch');

const { server, headers } = require('./test.conf');

const fetch = (...rest) => rawFetch(...rest).then(res => res.json()).catch(err => err.message);

const createTestUser = async (adminToken) => {
  const { username } = await fetch(`${server}/api/v1/admin/users`, { method: 'POST', headers: { ...headers, authentication: adminToken } });
  const body = { username, password: 'zeGermans' };
  const { apiToken } = await fetch(`${server}/token`, { method: 'POST', body: JSON.stringify(body), headers });
  return apiToken;
};

const createTestUserWithId = async (adminToken) => {
  const { username } = await fetch(`${server}/api/v1/admin/users`, { method: 'POST', headers: { ...headers, authentication: adminToken } });
  const body = { username, password: 'zeGermans' };
  const { id, apiToken } = await fetch(`${server}/token`, { method: 'POST', body: JSON.stringify(body), headers });
  return { id, apiToken };
};

module.exports = {
  createTestUser,
  fetch,
  createTestUserWithId,
};
