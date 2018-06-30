const fetch = require('node-fetch');

const { server, headers } = require('./helpers/test.conf');

describe('routes: /token', () => {
  test('generate valid token', async () => {
    const body = { username: 'bakufu', password: 'EndOria' };
    const response = await fetch(`${server}/token`, { method: 'POST', body: JSON.stringify(body), headers }).then(res => res.json());
    expect(Object.keys(response)).toEqual(expect.arrayContaining(['id', 'apiToken', 'chatToken', 'roles', 'identity']));
    expect(response.identity).toEqual('bakufu');
    expect(response.roles).toEqual(['decker', 'admin']);
  });
  test('wrong password', async () => {
    const body = { username: 'bakufu', password: 'End1Oria' };
    const response = await fetch(`${server}/token`, { method: 'POST', body: JSON.stringify(body), headers }).then(res => res.json());
    expect(response).toEqual({ error: 'Wrong username or password', status: 401 });
  });
  test('missing password', async () => {
    const body = { username: 'bakufu' };
    const response = await fetch(`${server}/token`, { method: 'POST', body: JSON.stringify(body), headers }).then(res => res.json());
    expect(response).toEqual({ error: 'Wrong username or password', status: 401 });
  });
  test('missing username', async () => {
    const body = { password: 'EndOria' };
    const response = await fetch(`${server}/token`, { method: 'POST', body: JSON.stringify(body), headers }).then(res => res.json());
    expect(response).toEqual({ error: 'Wrong username or password', status: 401 });
  });
  test('wrong username', async () => {
    const body = { username: 'ba1kufu', password: 'EndOria' };
    const response = await fetch(`${server}/token`, { method: 'POST', body: JSON.stringify(body), headers }).then(res => res.json());
    expect(response).toEqual({ error: 'Wrong username or password', status: 401 });
  });
  test('renew valid token', async () => {
    const body = { username: 'bakufu', password: 'EndOria' };
    const { apiToken } = await fetch(`${server}/token`, { method: 'POST', body: JSON.stringify(body), headers }).then(res => res.json());
    const response = await fetch(`${server}/token`, { method: 'PUT', body: JSON.stringify({ apiToken }), headers }).then(res => res.json());
    expect(apiToken).toEqual(response.apiToken);
    expect(Object.keys(response)).toEqual(expect.arrayContaining(['id', 'apiToken', 'chatToken', 'roles', 'identity']));
    expect(response.identity).toEqual('bakufu');
    expect(response.roles).toEqual(['decker', 'admin']);
  });
  test('renew invalid token', async () => {
    const apiToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJiYWt1ZnUiLCJyb2xlcyI6WyJkZWNrZXIiLCJhZG1pbjEiXSwiaWF0IjoxNTIzOTcwNjc0LCJleHAiOjE1MjM5NzQyNzR9.zPjhuWWF1oVX99vTca6z-teZ_v9Jx4d4zLRN77t3vtc';
    const response = await fetch(`${server}/token`, { method: 'PUT', body: JSON.stringify({ apiToken }), headers }).then(res => res.json());
    expect(response).toEqual({ error: 'Missing or malformed Token', status: 401 });
  });
  test('renew wrong payload', async () => {
    const apiToken = 'random giberish';
    const response = await fetch(`${server}/token`, { method: 'PUT', body: JSON.stringify({ apiToken }), headers }).then(res => res.json());
    expect(response).toEqual({ error: 'Missing or malformed Token', status: 401 });
  });
  test('renew missing token', async () => {
    const response = await fetch(`${server}/token`, { method: 'PUT', body: JSON.stringify({ }), headers }).then(res => res.json());
    expect(response).toEqual({ error: 'Missing or malformed Token', status: 401 });
  });
});

describe('routes: /gameToken', () => {
  test('generate valid mobile token', async () => {
    const body = { username: 'bakufu', password: 'EndOria' };
    const response = await fetch(`${server}/gameToken`, { method: 'POST', body: JSON.stringify(body), headers }).then(res => res.json());
    expect(Object.keys(response)).toEqual(expect.arrayContaining(['id', 'apiToken', 'roles', 'identity']));
    expect(response.identity).toEqual('bakufu');
    expect(response.roles).toEqual(['decker', 'admin']);
  });
  test('wrong password', async () => {
    const body = { username: 'bakufu', password: 'EndO1ria' };
    const response = await fetch(`${server}/gameToken`, { method: 'POST', body: JSON.stringify(body), headers }).then(res => res.json());
    expect(response).toEqual({ error: 'Wrong username or password', status: 401 });
  });
  test('missing password', async () => {
    const body = { username: 'bakufu' };
    const response = await fetch(`${server}/gameToken`, { method: 'POST', body: JSON.stringify(body), headers }).then(res => res.json());
    expect(response).toEqual({ error: 'Wrong username or password', status: 401 });
  });
  test('missing username', async () => {
    const body = { password: 'EndOria' };
    const response = await fetch(`${server}/gameToken`, { method: 'POST', body: JSON.stringify(body), headers }).then(res => res.json());
    expect(response).toEqual({ error: 'Wrong username or password', status: 401 });
  });
  test('wrong username', async () => {
    const body = { username: 'baku1fu', password: 'EndOria' };
    const response = await fetch(`${server}/gameToken`, { method: 'POST', body: JSON.stringify(body), headers }).then(res => res.json());
    expect(response).toEqual({ error: 'Wrong username or password', status: 401 });
  });
});
