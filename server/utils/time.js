const getISTTime = () => {
  const now = new Date();
  const IST = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
  return IST.toISOString().slice(0, 19).replace('T', ' ');
};

module.exports = { getISTTime };