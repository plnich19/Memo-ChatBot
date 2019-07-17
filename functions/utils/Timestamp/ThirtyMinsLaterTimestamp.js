module.exports = function ThirtyMinsLaterTimestamp() {
  const HALF = 1000 * 60 * 30;
  var aHalfLater = Date.now() + HALF;
  var aHalfLaterDate = new Date(new Date(aHalfLater));
  var aHalfLaterParse = Date.parse(aHalfLaterDate);
  var aHalfLaterTimestamp = new Date(aHalfLaterParse).setSeconds(0);
  console.log(new Date(aHalfLaterTimestamp));
  return aHalfLaterTimestamp;
};
