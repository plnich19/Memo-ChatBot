module.exports = function(dependencies) {
  return async function(req, res) {
    const {
      getMembers,
      replyCorouselToRoom,
      replyLiff,
      createTask,
      replyToken,
      groupId,
      replyConfirmButton,
      replyToRoom,
      dataOneDocumentRef
    } = dependencies;
    const msgType = req.body.events[0].message.type;
    if (msgType === "text") {
      let reqMessage = req.body.events[0].message.text || "";
      if (reqMessage !== "") {
        reqMessage = reqMessage.replace("#Create", "#create");
      } else if (reqMessage.includes("#create")) {
        return require("./createCmd")({
          reqMessage,
          createTask,
          replyToken,
          groupId,
          dataOneDocumentRef
        })(req, res);
      } else if (reqMessage.toLowerCase() === "#display") {
        replyLiff(groupId, "กดดูลิสต์ข้างล่างได้เลย!");
      } else if (reqMessage.toLowerCase() === "#help") {
        return require("./help")({
          groupId,
          replyToRoom,
          replyToken,
          replyConfirmButton
        })(req, res);
      }
    }
    return "reqTypeMsg runs";
  };
};
