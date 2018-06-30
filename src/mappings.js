// @flow

const orderStatus = {
  0: 'CREATED',
  1: 'COMPLETED',
  5: 'REJECTED',
};

const upgradeType = {
  0: 'humanity',
  1: 'level',
};

const timeMap = {
  days: 86400,
  hours: 3600,
  minutes: 60,
  seconds: 1,
  milliseconds: 0,
};

const scanMap = {
  0: 'item',
  1: 'player',
  2: 'mob',
  3: 'node',
};

module.exports = {
  orderStatus,
  scanMap,
  timeMap,
  upgradeType,
};
