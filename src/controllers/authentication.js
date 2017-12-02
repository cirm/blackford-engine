const bcrypt = require('bcrypt');
const db = require('../db');
const TokenService = require('../utilities/tokenService');
const config = require('../config');
const Promise = require('bluebird');
const JWT = Promise.promisifyAll(require('jsonwebtoken'));


const generateApiToken = user => JWT.signAsync({
  id: user.id,
  username: user.username,
  roles: user.roles,
}, config.tokenSecret, { expiresIn: config.tokenOptions.expiresIn });

const getTokens = async (ctx, next) => {
  const user = ctx.request.body;
  const users = await db.query('SELECT decker.get_player_data($1);', [user.username]);
  const qr = users.rows[0].get_player_data[0];
  const chatToken = TokenService.generate(user.username, user.device);
  const apiToken = await generateApiToken(qr);
  ctx.body = { identity: user.username, token: chatToken.toJwt(), apiToken, roles: qr.roles, id: qr.id };
};

module.exports = {
  getTokens,
};
