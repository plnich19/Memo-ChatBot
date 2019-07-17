module.exports = function(dependencies) {
  return async function(req, res) {
    console.log("Debugging getYourTask!");
    const { getYourTask } = dependencies;

    const groupId = req.query.groupId;
    const userId = req.query.userId;
    if (groupId !== undefined || userId !== undefined) {
      const rtnData = await getYourTask(groupId, userId);
      return res.status(200).send(JSON.stringify(rtnData));
    } else {
      const ret = { message: "Error getting this userId's tasks" };
      return res.status(400).send(ret);
    }
  };
};
