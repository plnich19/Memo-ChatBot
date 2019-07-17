function responseError(_, res) {
  const ret = { message: "action is not defined" };
  return res.status(400).send(ret);
}

module.exports = function DataAPI({
  functions,
  getMembers,
  getTasks,
  updateTask,
  deleteTask,
  getYourTask,
  getTaskDetailNotDone,
  getTaskDetailbyDate
}) {
  return functions.region("asia-east2").https.onRequest(async (req, res) => {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, OPTIONS");
    res.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, Content-Length, X-Requested-With, Accept"
    );

    const action = req.query.action;

    if (!action) {
      const ret = { message: "action is not defined" };
      return res.status(400).send(ret);
    }

    const responseAction =
      {
        getMembers: require("./getMembers")({ getMembers }),
        getTasks: require("./getTasks")({ getTasks }),
        updateTask: require("./updateTask")({ updateTask }),
        deleteTask: require("./deleteTask")({ deleteTask }),
        getYourTask: require("./getYourTask")({ getYourTask })
      }[action] || responseError;

    return responseAction(req, res);
  });
};
