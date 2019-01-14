require('dotenv').config('../.env');
const {
  query, transaction, first, all, closePool,
} = require('../src/db');
const logger = require('../src/utilities/winston');

const delay = 300000; // 5 min

const rewarder = async () => {
  const response = await query('select distinct on (gne.node_id) gne.id, gn.level, gne.owner, gne.captured, gne.node_id from game.node_status_events gne, game.nodes gn where gne.node_id = gn.id and gn.captured = true and gn.active = true order by gne.node_id, gne.captured desc ;').then(all);
  const updates = response.map(async (node) => {
    try {
      if (new Date(node.captured) > new Date(new Date().getTime() - delay)) {
        logger.info("Don't need to update, too recent capture for node: ", node.node_id);
        return;
      }
      const hasEntry = await query('select timestamp, node_event_id from game.node_compensation_events where node_event_id = $1 order by timestamp desc limit 1;', [node.id]).then(first);
      if (hasEntry) {
        if (new Date(hasEntry.timestamp) > new Date(new Date().getTime() - delay)) {
          logger.info("Don't need to update, was just compensated for node event: ", hasEntry.node_event_id);
          return;
        }
      }
      logger.info('Need to update compensation for node event: ', node.id);
      const ammount = node.level * 1000;
      const newTimestamp = new Date(new Date(hasEntry ? hasEntry.timestamp : new Date()).getTime() + delay);
      await transaction(
        ['INSERT INTO  game.node_compensation_events (node_event_id, ammount, timestamp, recipient) VALUES ($1, $2, $3, $4);', [node.id, ammount, newTimestamp, node.owner]],
        ['UPDATE characters.deckers SET wallet = wallet +$2 WHERE id = $1;', [node.owner, ammount]],
      );
    } catch (e) {
      logger.error(e);
      logger.info('Provisioning Failed for node event: ', node.node_event_id);
    }
  });
  await Promise.all(updates);
};


rewarder().finally(async () => { await closePool(); });
