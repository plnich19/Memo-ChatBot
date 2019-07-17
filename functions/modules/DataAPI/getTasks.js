module.exports = function(dependencies) {
  return async function(req, res) {
    console.log("Debugging getTasks!");
    const { getTasks } = dependencies;

    const groupId = req.query.groupId;
    if (groupId !== undefined) {
      const rtnData = await getTasks(groupId);
      return res.status(200).send(JSON.stringify(rtnData));
    } else {
      const ret = { message: "Error getting tasks" };
      return res.status(400).send(ret);
    }
  };
};
