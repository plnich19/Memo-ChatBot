module.exports = function ytdTimestampbyDate(datetime) {
  var date = new Date(datetime);
  console.log(date);
  var ytdTimestampbyDate = date.setHours(0, 0, 0, 0);
  console.log(ytdTimestampbyDate);
  return ytdTimestampbyDate;
};
