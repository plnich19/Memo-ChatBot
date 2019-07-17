module.exports = function(dependencies) {
  return async function(req, res) {
    console.log("Debugging getTaskDetailbyDate!");
    const { getTaskDetailbyDate } = dependencies;

    const groupId = req.query.groupId;
    const datetime = Number(req.query.datetime);
    console.log("datetime = ", datetime);
    if (groupId !== undefined || datetime !== undefined) {
      const rtnData = await getTaskDetailbyDate(groupId, datetime);
      return res.status(200).send(JSON.stringify(rtnData));
    } else {
      const ret = { message: "Error getting tasks by date" };
      return res.status(400).send(ret);
    }
  };
};
