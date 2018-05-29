const nukeDecker = async (ctx, next) => {
  const killer = ctx.user.id;
  const victim = ctx.params.playerId;
  return next();
};

module.exports = {
  nukeDecker,
};
