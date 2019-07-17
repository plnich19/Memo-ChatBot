module.exports = function(dependencies) {
  return async function(req, res) {
    console.log("Debugging getMembers!");
    const { getMembers } = dependencies;

    const groupId = req.query.groupId;
    if (groupId !== undefined) {
      const rtnData = await getMembers(groupId);
      return res.status(200).send(JSON.stringify(rtnData));
    } else {
      const ret = { message: "Error getting members" };
      return res.status(400).send(ret);
    }
  };
};
