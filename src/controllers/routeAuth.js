const Promise = require('bluebird');
const JWT = Promise.promisifyAll(require('jsonwebtoken'));
const config = require('../config');
const logger = require('../utilities/winston');

const userAuth = async (ctx, next) => {
  if (!ctx.request.headers || !ctx.request.headers.authentication) {
    ctx.status = 401;
    ctx.body = {
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Not this way.',
    };
    return ctx;
  }
  try {
    const { roles, id, username } = await JWT.verifyAsync(ctx.request.headers.authentication, config.tokenSecret);
    ctx.user = { roles, id, username };
  } catch (e) {
    logger.error(e.toString());
    ctx.status = 401;
    ctx.body = {
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Renew credentials.',
    };
    return ctx;
  }
  return next();
};

const checkRole = (ctx, next, role) => {
  if (ctx.user.roles.indexOf(role) === -1) {
    if (ctx.user.roles.indexOf('admin') === -1) {
      ctx.status = 401;
      ctx.body = {
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Feeling lucky, Punk?',
      };
      return ctx;
    }
  }
  return next();
};

const checkAdmin = (ctx, next) => checkRole(ctx, next, 'admin');
const checkDecker = (ctx, next) => checkRole(ctx, next, 'decker');
const checkMonitor = (ctx, next) => checkRole(ctx, next, 'monitor');

module.exports = {
  checkMonitor,
  checkDecker,
  checkAdmin,
  userAuth,
};
