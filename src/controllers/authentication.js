const bcrypt = require('bcrypt');
const db = require('../db');
const TokenService = require('../utilities/tokenService');
const config = require('../config');
const logger = require('../utilities/winston');
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
  ctx.body = {
    identity: user.username,
    chatToken: chatToken.toJwt(),
    apiToken,
    roles: qr.roles,
    id: qr.id,
  };
};

const renewToken = async (ctx, next) => {
  const tokens = ctx.request.body;
  logger.debug(`Renewal for: ${tokens.apiToken}`);
  try {
    const verified = await JWT.verifyAsync(tokens.apiToken, config.tokenSecret);
    const chatToken = TokenService.generate(verified.username, 'browser');
    const apiToken = await generateApiToken({ ...verified });
    ctx.body = {
      identity: verified.username,
      chatToken: chatToken.toJwt(),
      apiToken,
      roles: verified.roles,
      id: verified.id,
    };
  } catch (e) {
    logger.debug(e.toString());
    ctx.status = 404;
    ctx.body = { error: e.toString() };
  }
};

module.exports = {
  getTokens,
  renewToken,
};
