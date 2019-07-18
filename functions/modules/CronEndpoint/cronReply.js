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
        //return "Successfully replyToRoom";
      } else if (replyCondition === "liff") {
        return replyLiff(groupId, message);
        //return "Successfully replyLiff";
      }
      return "GroupsArray is mapped";
    });
    return res.status(200).send("ผ่าน");
  };
};
