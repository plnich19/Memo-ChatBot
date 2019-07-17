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
      const groupId = req.query.groupId;
      if (groupId !== undefined) {
        const rtnData = await getMembers(groupId);
        return res.status(200).send(JSON.stringify(rtnData));
      } else {
        const ret = { message: "Error getting members" };
        return res.status(400).send(ret);
      }
    } else if (action === "getTasks") {
      const groupId = req.query.groupId;
      if (groupId !== undefined) {
        const rtnData = await getTasks(groupId);
        return res.status(200).send(JSON.stringify(rtnData));
      } else {
        const ret = { message: "Error getting tasks" };
        return res.status(400).send(ret);
      }
    } else if (action === "updateTask") {
      // usage : https://asia-east2-memo-chatbot.cloudfunctions.net/DataAPI/?action=updateTask&groupId=Ce938b6c2ba40812b0afa36e11078ec56&taskId=xxxxxxxx
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
    } else if (action === "deleteTask") {
      // usage : https://asia-east2-memo-chatbot.cloudfunctions.net/DataAPI/?action=deleteTask&groupId=Ce938b6c2ba40812b0afa36e11078ec56&taskId=xxxxxxxx
      const groupId = req.query.groupId;
      const taskId = req.query.taskId;
      if (groupId !== undefined || taskId !== undefined) {
        const rtnData = await deleteTask(groupId, taskId);
        return res.status(200).send(JSON.stringify(rtnData));
      } else {
        const ret = { message: "Error deleting task" };
        return res.status(400).send(ret);
      }
    } else if (action === "getYourTask") {
      // usage : https://asia-east2-memo-chatbot.cloudfunctions.net/DataAPI/?action=getYourTask&groupId=Ce938b6c2ba40812b0afa36e11078ec56&userId=xxxxxxxx
      const groupId = req.query.groupId;
      const userId = req.query.userId;
      if (groupId !== undefined || userId !== undefined) {
        const rtnData = await getYourTask(groupId, userId);
        return res.status(200).send(JSON.stringify(rtnData));
      } else {
        const ret = { message: "Error getting this userId's tasks" };
        return res.status(400).send(ret);
      }
    } else if (action === "getTaskDetailNotDone") {
      // usage : https://asia-east2-memo-chatbot.cloudfunctions.net/DataAPI/?action=getTaskDetailNotDone&groupId=Ce938b6c2ba40812b0afa36e11078ec56
      const groupId = req.query.groupId;
      if (groupId !== undefined) {
        const rtnData = await getTaskDetailNotDone(groupId);
        return res.status(200).send(JSON.stringify(rtnData));
      } else {
        const ret = { message: "Error getting not done task" };
        return res.status(400).send(ret);
      }
    } else if (action === "getTaskDetailbyDate") {
      // usage : https://asia-east2-memo-chatbot.cloudfunctions.net/DataAPI/?action=getTaskDetailbyDate&groupId=Ce938b6c2ba40812b0afa36e11078ec56&datetime=timestamp
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
    }

    return "DataAPI is called";
  });
};
