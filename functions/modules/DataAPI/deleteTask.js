module.exports = function(dependencies) {
  return async function(req, res) {
    console.log("Debugging deleteTask!");
    const { deleteTask } = dependencies;

    const groupId = req.query.groupId;
    const taskId = req.query.taskId;
    if (groupId !== undefined || taskId !== undefined) {
      const rtnData = await deleteTask(groupId, taskId);
      return res.status(200).send(JSON.stringify(rtnData));
    } else {
      const ret = { message: "Error deleting task" };
      return res.status(400).send(ret);
    }
  };
};
