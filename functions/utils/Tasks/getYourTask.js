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

    let FindtasksDocumentRefCreateby = db
      .collection("data")
      .doc(groupId)
      .collection("tasks")
      .where("createby", "==", userId);
    console.log("getYourTask = ", getYourTask);
    let getCreatebyTask = await getTasksData(FindtasksDocumentRefCreateby);

    let arrconcat = getYourTask.concat(getCreatebyTask);
    let uniqueArr = [...new Set(arrconcat.map(data => data.taskId))].map(
      taskId => {
        return arrconcat.filter(each => {
          return each.taskId === taskId;
        })[0];
      }
    );
    console.log("uniqueArr = ", uniqueArr);
    return uniqueArr;
    //<-- End read data part -->
  };
};
