const dbQuery = require('../db/decker');
const bcrypt = require('../utilities/bcrypt');
const TokenService = require('../utilities/tokenService');
const config = require('../config');
const logger = require('../utilities/winston');
const Promise = require('bluebird');
const JWT = Promise.promisifyAll(require('jsonwebtoken'));
const { asyncPipe } = require('../utilities/functional');


const generateApiToken = ({ id, username, roles }) => JWT.signAsync({
  id,
  username,
  roles,
}, config.tokenSecret, { expiresIn: config.tokenOptions.expiresIn });

const parseUserFromBody = ({ request }) => ({ auth: request.body } || {});
const validateRawFields = (user) => {
  if (!user.auth.password || !user.auth.username) throw new Error('Missing required authentication payload for incoming request');
  return user;
};
const getExistingUser = async (user) => {
  const result = await dbQuery.getAuthData(user.auth.username);
  if (!result) throw new Error(`Unknown user authentication request for ${user.auth.username}`);
  return ({ ...user, db: result });
};

const validatePassword = async (user) => {
  const isAllowed = await bcrypt.compareHash(user.auth.password, user.db.hpassword);
  if (!isAllowed) throw new Error(`Wrong password for username: ${user.auth.username} `);
  return user;
};

const generateChatToken = user =>
  ({ ...user, chatToken: TokenService.generate(user.auth.username, user.auth.device).toJwt() });


const formatApiResponseBody = async ({ auth, db }) => ({
  identity: auth.username,
  apiToken: await generateApiToken(db),
  roles: db.roles,
  id: db.id,
});
const formatResponseBody = async ({ auth, db, chatToken }) => ({
  identity: auth.username,
  apiToken: await generateApiToken(db),
  roles: db.roles,
  id: db.id,
  chatToken,
});

const getAuthTokens = asyncPipe(
  parseUserFromBody,
  validateRawFields,
  getExistingUser,
  validatePassword,
  generateChatToken,
  formatResponseBody,
);

const getTokens = async (ctx, next) => {
  try {
    ctx.body = await getAuthTokens(ctx);
  } catch (e) {
    logger.error(e.toString());
    ctx.body = {
      error: 'Wrong username or password',
      code: 401,
    };
    ctx.status = 401;
    return ctx;
  }
  return next();
};

const getApiToken = asyncPipe(
  parseUserFromBody,
  validateRawFields,
  getExistingUser,
  validatePassword,
  formatApiResponseBody,
);

const getGameToken = async (ctx, next) => {
  try {
    ctx.body = await getApiToken(ctx);
  } catch (e) {
    logger.error(e.toString());
    ctx.body = {
      error: 'Wrong username or password',
      code: 401,
    };
    ctx.status = 401;
    return ctx;
  }
  return next();
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
    logger.error(e.toString());
    ctx.status = 404;
    ctx.body = { error: 'Missing or malformed Token', code: 401 };
    return ctx;
  }
  return next();
};

module.exports = {
  getTokens,
  renewToken,
  getGameToken,
};
