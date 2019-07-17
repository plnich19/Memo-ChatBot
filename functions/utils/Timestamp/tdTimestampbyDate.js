module.exports = function tdTimestampbyDate(datetime) {
  var td = new Date(datetime);
  var today = td.setDate(td.getDate() + 1);
  var tdTimestampbyDate = td.setUTCHours(0, 0, 0, 0);
  return tdTimestampbyDate;
};
