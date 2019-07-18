module.exports = function(dependencies) {
  return function(req, res) {
    const { groupId, DeleteGroupData } = dependencies;
    DeleteGroupData(groupId);
  };
};
