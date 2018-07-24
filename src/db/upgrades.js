// @flow
const { transaction } = require('./index');
const { upgradeType } = require('../mappings');


const handleUpgrade = async (deckerId: number, type: number, orderId: number) => {
  await transaction(
    [`UPDATE characters.deckers SET ${upgradeType[type]} = ${upgradeType[type]} +1 WHERE id = $1;`, [deckerId]],
    ['UPDATE characters.orders SET status = 1 where id = $1', [orderId]],
  );
};

module.exports = {
  handleUpgrade,
};
