const arrayChecker = (baseEaoHolders, quoteEoaHolders) => {
  return baseEaoHolders.some((v) => quoteEoaHolders.indexOf(v) >= 0);
};

module.exports = { arrayChecker };