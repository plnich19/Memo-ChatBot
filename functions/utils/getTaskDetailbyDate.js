const ytdTimestampbyDate = require("./ytdTimestampbyDate");
const tdTimestampbyDate = require("./tdTimestampbyDate");
const getTasksData = require("./getTasksData");

module.exports = function getTaskDetailbyDate(db) {
  return async function(groupId, datetime) {
    // <-- Read data from database part -->
    const yesterday = await ytdTimestampbyDate(datetime);
    const today = await tdTimestampbyDate(datetime);
    let FindtasksDocumentRef = db
      .collection("data")
      .doc(groupId)
      .collection("tasks")
      .where("datetime", ">=", yesterday)
      .where("datetime", "<", today);
    let getTaskDetail = await getTasksData(FindtasksDocumentRef);
    console.log("getTaskDetail = ", getTaskDetail);
    return getTaskDetail;
    //<-- End read data part -->
  };
};
