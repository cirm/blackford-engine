const server = require('../index');
const request = require('supertest');

describe('routes: /token', () => {
  test('generate valid token', async () => {
    const response = await request(server.callback()).post('/token').send({ username: 'bakufu', password: 'EndOria' });
    expect(Object.keys(response.body)).toEqual(expect.arrayContaining(['id', 'apiToken', 'chatToken', 'roles', 'identity']));
    expect(response.body.identity).toEqual('bakufu');
    expect(response.body.roles).toEqual(['decker', 'admin']);
  });
  test('wrong password', async () => {
    const response = await request(server.callback()).post('/token').send({ username: 'bakufu', password: 'End1Oria' });
    expect(response.status).toEqual(401);
    expect(response.body).toEqual({ error: 'Wrong username or password', code: 401 });
  });
  test('missing password', async () => {
    const response = await request(server.callback()).post('/token').send({ username: 'bakufu' });
    expect(response.status).toEqual(401);
    expect(response.body).toEqual({ error: 'Wrong username or password', code: 401 });
  });
  test('missing username', async () => {
    const response = await request(server.callback()).post('/token').send({ password: 'EndOria' });
    expect(response.status).toEqual(401);
    expect(response.body).toEqual({ error: 'Wrong username or password', code: 401 });
  });
  test('wrong username', async () => {
    const response = await request(server.callback()).post('/token').send({ username: 'bak1ufu', password: 'EndOria' });
    expect(response.status).toEqual(401);
    expect(response.body).toEqual({ error: 'Wrong username or password', code: 401 });
  });
  test('renew valid token', async () => {
    const response = await request(server.callback()).post('/token').send({ username: 'bakufu', password: 'EndOria' });
    const token = response.body.apiToken;
    const response2 = await request(server.callback()).put('/token').send({ apiToken: token });
    expect(token).toEqual(response2.body.apiToken);
    expect(Object.keys(response2.body)).toEqual(expect.arrayContaining(['id', 'apiToken', 'chatToken', 'roles', 'identity']));
    expect(response2.body.identity).toEqual('bakufu');
    expect(response2.body.roles).toEqual(['decker', 'admin']);
  });
  test('renew invalid token', async () => {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJiYWt1ZnUiLCJyb2xlcyI6WyJkZWNrZXIiLCJhZG1pbjEiXSwiaWF0IjoxNTIzOTcwNjc0LCJleHAiOjE1MjM5NzQyNzR9.zPjhuWWF1oVX99vTca6z-teZ_v9Jx4d4zLRN77t3vtc';
    const response = await request(server.callback()).put('/token').send({ apiToken: token });
    expect(response.body).toEqual({ error: 'Missing or malformed Token', code: 401 });
  });
  test('renew wrong payload', async () => {
    const token = 'random giberish';
    const response = await request(server.callback()).put('/token').send({ apiToken: token });
    expect(response.body).toEqual({ error: 'Missing or malformed Token', code: 401 });
  });
  test('renew missing token', async () => {
    const token = 'random giberish';
    const response = await request(server.callback()).put('/token').send({ api1Token: token });
    expect(response.body).toEqual({ error: 'Missing or malformed Token', code: 401 });
  });
});

describe('routes: /gameToken', () => {
  test('generate valid mobile token', async () => {
    const response = await request(server.callback()).post('/gameToken').send({ username: 'bakufu', password: 'EndOria' });
    expect(Object.keys(response.body)).toEqual(expect.arrayContaining(['id', 'apiToken', 'roles', 'identity']));
    expect(response.body.identity).toEqual('bakufu');
    expect(response.body.roles).toEqual(['decker', 'admin']);
  });
  test('wrong password', async () => {
    const response = await request(server.callback()).post('/gameToken').send({ username: 'bakufu', password: 'End1Oria' });
    expect(response.status).toEqual(401);
    expect(response.body).toEqual({ error: 'Wrong username or password', code: 401 });
  });
  test('missing password', async () => {
    const response = await request(server.callback()).post('/gameToken').send({ username: 'bakufu' });
    expect(response.status).toEqual(401);
    expect(response.body).toEqual({ error: 'Wrong username or password', code: 401 });
  });
  test('missing username', async () => {
    const response = await request(server.callback()).post('/gameToken').send({ password: 'EndOria' });
    expect(response.status).toEqual(401);
    expect(response.body).toEqual({ error: 'Wrong username or password', code: 401 });
  });
  test('wrong username', async () => {
    const response = await request(server.callback()).post('/gameToken').send({ username: 'bak1ufu', password: 'EndOria' });
    expect(response.status).toEqual(401);
    expect(response.body).toEqual({ error: 'Wrong username or password', code: 401 });
  });
});

