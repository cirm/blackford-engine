const Promise = require('bluebird');

const promisePipe2 = (...fns) => (...args) => Promise.reduce(fns, (f, g) => g(f), ...args);

const promisePipe1 = (...fns) => (...args) => fns.reduce((f, g) => Promise.resolve(f).then(g), ...args);

const asyncPipe = (...fns) => (...args) =>
  fns.reduce((f, g) => f.then(g), Promise.resolve(...args));

const compose = (...fns) => fns.reduce((f, g) => (...args) => f(g(...args)));

const pipe = (...functions) => data =>
  functions.reduce((value, func) => func(value), data);

module.exports = { asyncPipe, compose, pipe };

