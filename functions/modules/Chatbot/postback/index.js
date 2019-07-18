module.exports = function(dependencies) {
  return async function(req, res) {
    const {
      db,
      getUserProfileById,
      replyToken,
      groupId,
      dataOneDocumentRef,
      getMemberProfilebyId,
      reply,
      updateTime
    } = dependencies;
    const postbackData = req.body.events[0].postback.data;
    if (postbackData === "confirm") {
      return require("./confirm")({
        getUserProfileById,
        replyToken,
        groupId,
        dataOneDocumentRef,
        reply
      })(req, res);
    } else if (postbackData.includes("Make admin")) {
      const MakeAdminSplitText = postbackData.split(" ");
      setAdmin(groupId, MakeAdminSplitText);
    } else if (postbackData.includes("taskId=")) {
      return require("./taskId")({
        replyToken,
        groupId,
        postbackData,
        updateTime
      })(req, res);
    } else if (postbackData.includes("cancel")) {
      return require("./cancle")({
        db,
        replyToken,
        groupId,
        postbackData,
        getMemberProfilebyId,
        reply
      })(req, res);
    }
  };
};
