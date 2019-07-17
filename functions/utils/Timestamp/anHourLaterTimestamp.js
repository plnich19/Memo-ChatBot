module.exports = function anHourLaterTimestamp() {
  const HOUR = 1000 * 60 * 60;
  var anHourLater = Date.now() + HOUR;
  var anHourLaterDate = new Date(new Date(anHourLater));
  var anHourLaterParse = Date.parse(anHourLaterDate);
  var anHourLaterTimestamp = new Date(anHourLaterParse).setSeconds(0);
  console.log(new Date(anHourLaterTimestamp));
  return anHourLaterTimestamp;
};
