module.exports = function getNumberOfMessagesSentThisMonth(
  request,
  getLINE_HEADER
) {
  return request({
    method: `GET`,
    uri: `https://api.line.me/v2/bot/message/quota/consumption`,
    headers: getLINE_HEADER,
    json: true
  }).then(response => {
    return response;
  });
};
