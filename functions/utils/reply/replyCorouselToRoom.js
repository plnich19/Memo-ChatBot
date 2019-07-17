module.exports = function replyCorouselToRoom(client) {
  return function(groupId, UsersArray) {
    return client.pushMessage(groupId, {
      type: "template",
      altText: "this is a carousel template",
      template: {
        type: "carousel",
        actions: [],
        columns: UsersArray.map(member => {
          return {
            thumbnailImageUrl: member.pictureUrl,
            title: member.displayName,
            text: member.role,
            actions: [
              {
                type: "postback",
                label: "Make admin",
                data: `Make admin ${member.userId}`
              }
            ]
          };
        })
      }
    });
  };
};
