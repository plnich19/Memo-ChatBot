module.exports = function(dependencies) {
  return async function(req, res) {
    console.log("Debugging updateTask!");
    const { updateTask } = dependencies;

    const groupId = req.query.groupId;
    const taskId = req.query.taskId;
    const data = req.body;
    if (groupId !== undefined || taskId !== undefined) {
      const rtnData = await updateTask(groupId, taskId, data);
      // console.log('updateTask rtnData',rtnData);
      if (rtnData) {
        return res.status(200).send(JSON.stringify({ result: rtnData }));
      } else {
        const ret = { message: "Fail to update task" };
        return res.status(400).send(ret);
      }
    } else {
      const ret = { message: "Couldn't update--missing parameters" };
      return res.status(400).send(ret);
    }
  };
};
