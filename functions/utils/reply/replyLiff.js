module.exports = function replyLiff(client) {
  return function(groupId, message) {
    return client.pushMessage(groupId, {
      type: "flex",
      altText: message,
      contents: {
        type: "bubble",
        hero: {
          type: "image",
          url: "https://sv1.picz.in.th/images/2019/07/19/KRGSPk.jpg",
          size: "full",
          aspectRatio: "3:1",
          aspectMode: "cover",
          action: {
            type: "uri",
            label: "Line",
            uri: "line://app/1568521906-qP1vaA4y"
          }
        }
      }
    });
  };
};
