module.exports = function reply(client) {
  return function(replyToken, message) {
    return client.replyMessage(replyToken, {
      type: "text",
      text: message
    });
  };
};
