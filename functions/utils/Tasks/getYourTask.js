module.exports = function getYourTask(db) {
  const getTasksData = require("./getTasksData");
  return async function(groupId, userId) {
    // <-- Read data from database part -->
    let FindtasksDocumentRef = db
      .collection("data")
      .doc(groupId)
      .collection("tasks")
      .where("assignee", "array-contains", userId);
    let getYourTask = await getTasksData(FindtasksDocumentRef);
    console.log("getYourTask = ", getYourTask);
    return getYourTask;
    //<-- End read data part -->
  };
};
