module.exports = function reply(client) {
  return function(replyToken, message) {
    console.log("client = ", client);
    console.log("Reply some message:", message);
    console.log("replyToken = ", replyToken);
    const replyclient = client.replyMessage(replyToken, {
      type: "text",
      text: message
    });
    console.log("replyClient - ", replyclient);
    return replyclient;
  };
};
