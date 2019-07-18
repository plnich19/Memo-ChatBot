module.exports = function(dependencies) {
  return function(req, res) {
    const { DeleteUserData, groupId } = dependencies;
    const userId = req.body.events[0].left.members[0].userId;
    DeleteUserData(groupId, userId);
  };
};
