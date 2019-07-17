const getTasksData = require("./getTasksData");
const ytdTimestamp = require("./ytdTimestamp");
const tdTimestamp = require("./tdTimestamp");

module.exports = function getTaskDetailNotDone(db) {
  return async function(groupId) {
    // <-- Read data from database part -->
    const yesterday = await ytdTimestamp();
    const today = await tdTimestamp();
    let FindtasksDocumentRef = db
      .collection("data")
      .doc(groupId)
      .collection("tasks")
      .where("status", "==", false)
      .where("datetime", ">=", yesterday)
      .where("datetime", "<", today);
    let getTaskDetail = await getTasksData(FindtasksDocumentRef);
    console.log("getTaskDetail = ", getTaskDetail);
    return getTaskDetail;
    //<-- End read data part -->
  };
};
