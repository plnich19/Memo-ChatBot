module.exports = function(dependencies) {
  return function(req, res) {
    const { replyToken, postbackData, updateTime } = dependencies;
    const splitText = postbackData.split("=");
    const datetime = req.body.events[0].postback.params.datetime;
    updateTime(replyToken, groupId, splitText[1], datetime);
  };
};
