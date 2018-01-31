const db = require('../db');
const bcrypt = require('../utilities/bcrypt');
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
  const rawUser = ctx.request.body;
  try {
    const dbResult = await db.query('SELECT decker.get_player_data($1);', [rawUser.username]);
    const user = dbResult.rows[0].get_player_data[0];
    const isAllowed = await bcrypt.compareHash(rawUser.password, user.hpassword);
    if (!isAllowed) throw new Error(`Wrong password for username: ${rawUser.username} `);
    const chatToken = TokenService.generate(rawUser.username, rawUser.device);
    const apiToken = await generateApiToken(user);
    ctx.body = {
      identity: rawUser.username,
      chatToken: chatToken.toJwt(),
      apiToken,
      roles: user.roles,
      id: user.id,
    };
  } catch (e) {
    logger.error(e.toString());
    ctx.body = {
      error: 'Wrong username or password',
      code: 403,
    };
    ctx.status = 403;
  }
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
