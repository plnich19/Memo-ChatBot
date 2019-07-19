module.exports = function tdTimestamp() {
  const HOUR = 7 * 1000 * 60 * 60;
  var td = new Date();
  var today = td.setDate(td.getDate() + 1);
  var tdTimestamp = td.setUTCHours(0, 0, 0, 0);
  var tsp = tdTimestamp - HOUR;
  console.log("tsp", tsp);
  return tsp;
};
