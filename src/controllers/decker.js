const nukeDecker = async (ctx, next) => {
// move victim to haven
// log Kill
// add bounty
  const killer = ctx.user.id;
  console.log(killer);
  const victim = ctx.params.playerId;
  console.log(victim);
  return next();
};

const ravageDecker = async (ctx, next) => {
  // move victim to haven
  // log kill
  // deduct money
  // lood bounty
  // TODO: loot inventory?
  const killer = ctx.user.id;
  console.log(killer);
  const victim = ctx.params.playerId;
  console.log(victim);
  return next();
};

module.exports = {
  nukeDecker,
};
