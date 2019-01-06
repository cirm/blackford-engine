const queryNodes = 'SELECT * FROM game.nodes;';
const queryCapturedStatus = 'SELECT DISTINCT(nse.node_id), nse.owner, c.decker, nse.captured FROM game.node_status_events nse, characters.deckers c WHERE c.id = nse.owner ORDER BY captured DESC;';
const queryNodeCapturedHistory = 'SELECT nse.node_id, nse.owner, c.decker, nse.captured FROM game.node_status_events nse, characters.deckers c WHERE c.id = nse.owner and nse.node_id = $1 ORDER BY captured DESC;';

module.exports = {
  queryNodes,
  queryNodeCapturedHistory,
  queryCapturedStatus,
};
