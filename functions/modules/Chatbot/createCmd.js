module.exports = function createCmd(dependencies) {
  return async function(req, res) {
    const { reqMessage, createTask, replyToken, groupId } = dependencies;

    const userId = req.body.events[0].source.userId;
    const userSaid = reqMessage.split("#create")[1];
    if (reqMessage.includes("@")) {
      console.log("userSaid = ", userSaid);
      createTask(replyToken, groupId, userId, userSaid, true);
    } else {
      createTask(replyToken, groupId, userId, userSaid, false);
    }
  };
};
