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


module.exports = {
  orderStatus,
  timeMap,
  upgradeType,
};
