module.exports = function replyTaskCorouselToRoom(client) {
  return function(groupId, TasksArray) {
    return client.pushMessage(groupId, {
      type: "template",
      altText: "this is a carousel template",
      template: {
        type: "carousel",
        actions: [],
        columns: TasksArray.map(task => {
          var event = new Date(task.datetime);
          var date = event.toDateString();
          return {
            title: task.title,
            text: `Status: ${task.status} Date: ${date}`,
            actions: [
              {
                type: "message",
                label: "Action 1",
                text: "Action 1"
              }
            ]
          };
        })
      }
    });
  };
};
