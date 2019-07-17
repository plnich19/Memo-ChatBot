module.exports = function replyToRoom(client) {
  return function(groupId, message) {
    return client.pushMessage(groupId, {
      type: "text",
      text: message
    });
  };
};
