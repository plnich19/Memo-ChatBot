module.exports = function ytdTimestamp() {
  const HOUR = 7 * 1000 * 60 * 60;
  var ytd = new Date();
  var ytdTimestamp = ytd.setUTCHours(0, 0, 0, 0);
  var tsp = ytdTimestamp - HOUR;
  console.log("tsp", tsp);
  return tsp;
};
