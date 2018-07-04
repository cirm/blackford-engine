const Promise = require('bluebird');
const JWT = Promise.promisifyAll(require('jsonwebtoken'));
const { getAuthData } = require('../db/decker');
const bcrypt = require('../utilities/bcrypt');
const TokenService = require('../utilities/tokenService');
const { tokenSecret, tokenOptions } = require('../config');
const logger = require('../utilities/winston');
const { asyncPipe } = require('../utilities/functional');

const AuthError = (message, params, status = 401) => {
  const err = new Error(message);
  err.status = status;
  err.expose = 'Wrong username or password';
  if (params) { err.params = params; }
  throw err;
};
const TokenError = (message, params, status = 401) => {
  const err = new Error(message);
  err.status = status;
  err.expose = 'Missing or malformed Token';
  if (params) { err.params = params; }
  throw err;
};

const generateApiToken = ({ id, username, roles }) => JWT.signAsync({
  id,
  username,
  roles,
}, tokenSecret, { expiresIn: tokenOptions.expiresIn });

const parseUserFromBody = ({ request, db }) => ({ auth: request.body, db } || {});
const validateRawFields = ({ auth, ...rest }) => {
  if (!auth.password || !auth.username) AuthError('Missing required authentication payload for incoming request');
  return { auth, ...rest };
};
const getExistingUser = async ({ auth, db, ...rest }) => {
  const resp = await getAuthData(auth.username, db.query);
  if (!resp || !resp.id) AuthError(`Unknown user authentication request for ${auth.username}`);
  return ({
    auth, user: resp, ...rest, db,
  });
};

const validatePassword = async ({ auth, user, ...rest }) => {
  const isAllowed = await bcrypt.compareHash(auth.password, user.hpassword);
  if (!isAllowed) AuthError(`Wrong password for username: ${auth.username} `);
  return { auth, user, ...rest };
};

const generateChatToken = ({ auth, ...rest }) => ({
  ...rest,
  auth,
  chatToken: TokenService.generate(auth.username, auth.device).toJwt(),
});

const formatApiResponseBody = async ({ auth, user }) => ({
  identity: auth.username,
  apiToken: await generateApiToken(user),
  roles: user.roles,
  id: user.id,
});
const formatResponseBody = async ({ auth, user, chatToken }) => ({
  identity: auth.username,
  apiToken: await generateApiToken(user),
  roles: user.roles,
  id: user.id,
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

const getTokens = async (ctx) => {
  ctx.body = await getAuthTokens(ctx);
};

const getApiToken = asyncPipe(
  parseUserFromBody,
  validateRawFields,
  getExistingUser,
  validatePassword,
  formatApiResponseBody,
);

const getGameToken = async (ctx) => {
  ctx.body = await getApiToken(ctx);
};

const parseTokenFromBody = ({ request }) => ({ tokens: request.body } || {});

const logRequest = ({ tokens, ...rest }) => {
  logger.debug(`Renewal for: ${tokens.apiToken}`);
  return { tokens, ...rest };
};


const verifyToken = async ({ tokens }) => {
  try {
    const { username, id, roles } = await JWT.verifyAsync(tokens.apiToken, tokenSecret);
    return {
      ...tokens, auth: { username, device: 'browser' }, username, id, roles,
    };
  } catch (e) {
    return TokenError(e.message);
  }
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

const renewToken = async (ctx) => {
  ctx.body = await renewTokens(ctx);
};

module.exports = {
  getTokens,
  renewToken,
  getGameToken,
};
