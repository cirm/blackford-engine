const fetch = require('node-fetch');

const { server, headers } = require('./test.conf');

const createTestUser = async (adminToken) => {
  const { username } = await fetch(`${server}/api/v1/admin/users`, { method: 'POST', headers: { ...headers, authentication: adminToken } }).then(res => res.json());
  const body = { username, password: 'zeGermans' };
  const apiToken = await fetch(`${server}/token`, { method: 'POST', body: JSON.stringify(body), headers }).then(res => res.json()).then(res => res.apiToken);
  return apiToken;
};

module.exports = {
  createTestUser,
};

