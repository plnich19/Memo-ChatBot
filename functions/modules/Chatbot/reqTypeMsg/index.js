module.exports = function(dependencies) {
  return async function(req, res) {
    const {
      getMembers,
      replyCorouselToRoom,
      replyLiff,
      createTask,
      replyToken,
      groupId
    } = dependencies;
    const msgType = req.body.events[0].message.type;
    if (msgType === "text") {
      let reqMessage = req.body.events[0].message.text || "";
      if (reqMessage !== "") {
        reqMessage = reqMessage.replace("#Create", "#create");
      }
      if (reqMessage.toLowerCase() === "#member") {
        const getUsers = await getMembers(groupId);
        replyCorouselToRoom(groupId, getUsers);
      } else if (reqMessage.includes("#create")) {
        return require("./createCmd")({
          reqMessage,
          createTask,
          replyToken,
          groupId
        })(req, res);
      } else if (reqMessage.toLowerCase() === "#display") {
        replyLiff(groupId, "กดดูลิสต์ข้างล่างได้เลย!");
      }
    }
  };
};
