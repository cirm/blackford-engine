const { getAuthData } = require('../db/decker');
const bcrypt = require('../utilities/bcrypt');
const TokenService = require('../utilities/tokenService');
const { tokenSecret, tokenOptions } = require('../config');
const logger = require('../utilities/winston');
const Promise = require('bluebird');
const JWT = Promise.promisifyAll(require('jsonwebtoken'));
const { asyncPipe } = require('../utilities/functional');


const generateApiToken = ({ id, username, roles }) => JWT.signAsync({
  id,
  username,
  roles,
}, tokenSecret, { expiresIn: tokenOptions.expiresIn });

const parseUserFromBody = ({ request }) => ({ auth: request.body } || {});
const validateRawFields = (user) => {
  if (!user.auth.password || !user.auth.username) throw new Error('Missing required authentication payload for incoming request');
  return user;
};
const getExistingUser = async (user) => {
  const result = await getAuthData(user.auth.username);
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

const parseTokenFromBody = ({ request }) => ({ tokens: request.body } || {});

const logRequest = (payload) => {
  logger.debug(`Renewal for: ${payload.tokens.apiToken}`);
  return payload;
};

const verifyToken = async ({ tokens }) => {
  const { username, id, roles } = await JWT.verifyAsync(tokens.apiToken, tokenSecret);
  return {
    ...tokens, auth: { username, device: 'browser' }, username, id, roles,
  };
};

const formatRenewalResponseBody = async ({
  username, id, roles, chatToken,
}) => ({
  identity: username,
  apiToken: await generateApiToken({ id, username, roles }),
  chatToken,
  roles,
  id,
});

const renewTokens = asyncPipe(
  parseTokenFromBody,
  logRequest,
  verifyToken,
  generateChatToken,
  formatRenewalResponseBody,
);

const renewToken = async (ctx, next) => {
  try {
    ctx.body = await renewTokens(ctx);
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
