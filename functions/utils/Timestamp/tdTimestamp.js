module.exports = function tdTimestamp() {
  var td = new Date();
  var today = td.setDate(td.getDate() + 1);
  var tdTimestamp = td.setUTCHours(0, 0, 0, 0);
  console.log("tdtimestamp", tdTimestamp);
  return tdTimestamp;
};
