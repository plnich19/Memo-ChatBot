module.exports = function Chatbot({
  db,
  functions,
  dataOneDocumentRef,
  getMembers,
  replyCorouselToRoom,
  createTask,
  replyLiff,
  replyConfirmButton,
  DeleteGroupData,
  DeleteUserData,
  reply,
  getUserProfileById,
  getMemberProfilebyId,
  setAdmin,
  updateTime
}) {
  return functions.region("asia-east2").https.onRequest(async (req, res) => {
    const reqType = req.body.events[0].type;
    console.log("reqType = ", reqType);
    const replyToken = req.body.events[0].replyToken;
    console.log("replyToken = ", replyToken);
    const groupId = req.body.events[0].source.groupId;
    if (reqType === "message") {
      return require("./reqTypeMsg")({
        getMembers,
        replyCorouselToRoom,
        replyLiff,
        createTask,
        replyToken,
        groupId
      })(req, res);
    } else if (reqType === "join") {
      return require("./reqTypeJoin")({
        replyToRoom,
        replyToken,
        replyConfirmButton
      })(req, res);
    } else if (reqType === "leave") {
      DeleteGroupData(groupId);
    } else if (reqType === "memberJoined") {
      return require("./MemberJoinedCond")({
        getUserProfileById,
        groupId,
        replyToken,
        replyToRoom,
        replyConfirmButton
      })(req, res);
    } else if (reqType === "memberLeft") {
      return require("./memberLeftCond")({
        DeleteUserData,
        groupId
      })(req, res);
    } else if (reqType === "follow") {
      return require("./followCond")({
        replyToken
      })(req, res);
    } else if (reqType === "postback") {
      return require("./postback")({
        db,
        getUserProfileById,
        replyToken,
        groupId,
        dataOneDocumentRef,
        getMemberProfilebyId,
        reply,
        updateTime
      })(req, res);
    }
  });
};
