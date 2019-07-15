module.exports = function getTargetLimitForAdditionalMessages(request) {
  return function(getLINE_HEADER) {
    return request({
      method: `GET`,
      uri: `https://api.line.me/v2/bot/message/quota`,
      headers: getLINE_HEADER,
      json: true
    }).then(response => {
      return response;
    });
  };
};
