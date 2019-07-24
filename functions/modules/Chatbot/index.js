function responseError(_, res) {
  const ret = { message: "action is not defined" };
  return res.status(400).send(ret);
}

module.exports = function Chatbot({
  db,
  functions,
  dataOneDocumentRef,
  getMembers,
  replyCorouselToRoom,
  createTask,
  replyToRoom,
  replyLiff,
  replyConfirmButton,
  WriteGroupData,
  DeleteGroupData,
  DeleteUserData,
  reply,
  getUserProfileById,
  getMemberProfilebyId,
  updateTime
}) {
  return functions.region("asia-east2").https.onRequest(async (req, res) => {
    const reqType = req.body.events[0].type;
    const replyToken = req.body.events[0].replyToken;
    const groupId = req.body.events[0].source.groupId;

    const responseAction =
      {
        message: require("./reqTypeMsg")({
          getMembers,
          replyCorouselToRoom,
          replyLiff,
          createTask,
          replyToken,
          groupId,
          replyConfirmButton,
          WriteGroupData,
          replyToRoom,
          dataOneDocumentRef
        }),
        join: require("./reqTypeJoin")({
          groupId,
          replyToRoom,
          replyToken,
          replyConfirmButton,
          WriteGroupData
        }),
        leave: require("./reqTypeLeave")({ groupId, DeleteGroupData }),
        memberJoined: require("./reqTypememberJoined")({
          db,
          reply,
          getUserProfileById,
          groupId,
          replyToken,
          replyToRoom,
          replyConfirmButton
        }),
        memberLeft: require("./reqTypememberLeft")({
          DeleteUserData,
          groupId
        }),
        follow: require("./reqTypeFollow")({
          replyToken,
          reply
        }),
        postback: require("./reqTypepostback")({
          db,
          getUserProfileById,
          replyToken,
          groupId,
          dataOneDocumentRef,
          getMemberProfilebyId,
          reply,
          updateTime
        })
      }[reqType] || responseError;

    return responseAction(req, res);
  });
};
