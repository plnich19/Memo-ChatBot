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

    if (action === "getMembers") {
      return require("./getMember")({ getMembers })(req, res);
    } else if (action === "getTasks") {
      return require("./getTasks")({ getTasks })(req, res);
    } else if (action === "updateTask") {
      // usage : https://asia-east2-memo-chatbot.cloudfunctions.net/DataAPI/?action=updateTask&groupId=Ce938b6c2ba40812b0afa36e11078ec56&taskId=xxxxxxxx
      return require("./updateTask")({ updateTask })(req, res);
    } else if (action === "deleteTask") {
      // usage : https://asia-east2-memo-chatbot.cloudfunctions.net/DataAPI/?action=deleteTask&groupId=Ce938b6c2ba40812b0afa36e11078ec56&taskId=xxxxxxxx
      return require("./deleteTask")({ deleteTask })(req, res);
    } else if (action === "getYourTask") {
      // usage : https://asia-east2-memo-chatbot.cloudfunctions.net/DataAPI/?action=getYourTask&groupId=Ce938b6c2ba40812b0afa36e11078ec56&userId=xxxxxxxx
      return require("./getYourTask")({ getYourTask })(req, res);
    } else if (action === "getTaskDetailNotDone") {
      // usage : https://asia-east2-memo-chatbot.cloudfunctions.net/DataAPI/?action=getTaskDetailNotDone&groupId=Ce938b6c2ba40812b0afa36e11078ec56
      return require("./getTaskDetailNotDone")({ getTaskDetailNotDone })(
        req,
        res
      );
    } else if (action === "getTaskDetailbyDate") {
      // usage : https://asia-east2-memo-chatbot.cloudfunctions.net/DataAPI/?action=getTaskDetailbyDate&groupId=Ce938b6c2ba40812b0afa36e11078ec56&datetime=timestamp
      return require("./getTaskDetailbyDate")({ getTaskDetailbyDate })(
        req,
        res
      );
    }

    return "DataAPI is called";
  });
};
