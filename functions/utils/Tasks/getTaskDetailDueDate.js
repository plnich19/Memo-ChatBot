const ytdTimestamp = require("./ytdTimestamp");
const tdTimestamp = require("./tdTimestamp");
const anHourLaterTimestamp = require("./anHourLaterTimestamp");
const ThirtyMinsLaterTimestamp = require("./ThirtyMinsLaterTimestamp");
const getTasksData = require("./getTasksData");

module.exports = function getTaskDetailDueDate(db) {
  return async function(groupId) {
    console.log("groupID = ", groupId);
    // <-- Read data from database part -->
    var TasksArray = [];
    const yesterday = await ytdTimestamp();
    const today = await tdTimestamp();
    const anHourLater = await anHourLaterTimestamp();
    const aHalfLater = await ThirtyMinsLaterTimestamp();
    console.log("anHourLater = ", anHourLater);
    console.log("aHalfLater = ", aHalfLater);
    let FindtasksDocumentRef = db
      .collection("data")
      .doc(groupId)
      .collection("tasks")
      .where("status", "==", false)
      .where("datetime", ">=", yesterday)
      .where("datetime", "<", today);
    let getTaskDetail = await getTasksData(FindtasksDocumentRef);
    console.log("getTaskDetail = ", getTaskDetail);
    await getTaskDetail.map(task => {
      if (task.datetime === anHourLater) {
        console.log("เข้า anhourlater");
        TasksArray.push({
          condition: "anHour",
          userId: task.assignee,
          title: task.title,
          createby: task.createby
        });
      } else if (task.datetime === aHalfLater) {
        console.log("เข้า ahalflater");
        TasksArray.push({
          condition: "aHalf",
          userId: task.assignee,
          title: task.title,
          createby: task.createby
        });
      }
      return "getTaskDetail is mapped";
    });
    console.log("TasksArray = ", TasksArray);
    return TasksArray;
    //<-- End read data part -->};
  };
};
