const Promise = require('bluebird');

const promisePipe2 = (...fns) => (...args) => Promise.reduce(fns, (f, g) => g(f), ...args);

const promisePipe1 = (...fns) => (...args) => fns.reduce((f, g) => Promise.resolve(f).then(g), ...args);

const asyncPipe = (...fns) => (...args) => fns.reduce((f, g) => f.then(g), Promise.resolve(...args));

const compose = (...fns) => fns.reduce((f, g) => (...args) => f(g(...args)));

const pipe = (...functions) => data => functions.reduce((value, func) => func(value), data);

const curry = fn => (...xs) => {
  if (xs.length === 0) {
    throw Error('EMPTY INVOCATION');
  }
  if (xs.length >= fn.length) {
    return fn(...xs);
  }
  return curry(fn.bind(null, ...xs));
};

module.exports = {
  asyncPipe, compose, pipe, curry,
};
