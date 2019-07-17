function responseError(_, res) {
  const ret = { message: "action is not defined" };
  return res.status(400).send(ret);
}

module.exports = function CronEndpoint({
  functions,
  getLINE_HEADER,
  dataOneDocumentRef,
  getTargetLimitForAdditionalMessages,
  getNumberOfMessagesSentThisMonth,
  getGroupIds,
  getMembersLength,
  getTaskDetailDueDate,
  replyToRoom,
  replyLiff
}) {
  return functions.region("asia-east2").https.onRequest(async (req, res) => {
    const action = req.query.action;
    const message = req.query.message;

    if (!action) return responseError(req, res);

    let getTargetLimit = await getTargetLimitForAdditionalMessages(
      getLINE_HEADER
    )
      .then(res => {
        return res.value;
      })
      .catch(error => {
        console.log("error", error);
      });
    let getNumberMsg = await getNumberOfMessagesSentThisMonth(getLINE_HEADER)
      .then(res => {
        return res.totalUsage;
      })
      .catch(error => {
        console.log("error", error);
      });
    let remain = getTargetLimit - getNumberMsg;
    console.log("remain = ", remain);
    let GroupsArray = await getGroupIds(dataOneDocumentRef);
    let MembersCount = await getMembersLength(GroupsArray);
    var TotalMembers = Math.max(...MembersCount);
    let MsgUse = TotalMembers + getNumberMsg;

    if (remain >= MsgUse) {
      const cronReply = require("./cronReply");
      const responseAction =
        {
          personalNotice: require("./personalNotice")({
            getTaskDetailDueDate,
            replyToRoom,
            GroupsArray
          }),

          broadcastTogroup: cronReply({
            replyToRoom,
            replyLiff,
            GroupsArray,
            replyCondition: "room",
            message
          }),

          broadcastLiff: cronReply({
            replyToRoom,
            replyLiff,
            GroupsArray,
            replyCondition: "liff",
            message
          })
        }[action] || responseError;
      return responseAction(req, res);
    }
  });
};
