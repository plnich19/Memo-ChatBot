module.exports = function(dependencies) {
  return function(req, res) {
    const {
      replyToRoom,
      replyLiff,
      GroupsArray,
      replyCondition,
      message
    } = dependencies;

    GroupsArray.map(groupId => {
      if (replyCondition === "room") {
        return replyToRoom(groupId, message);
      } else if (replyCondition === "liff") {
        return replyLiff(groupId, message);
      }
      return "GroupsArray is mapped";
    });
    return res.status(200).send("ผ่าน");
  };
};
