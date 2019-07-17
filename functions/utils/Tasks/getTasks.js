const getTasksData = require("./getTasksData");

module.exports = function getTasks(db) {
  return async function(groupId) {
    // <-- Read data from database part -->
    let tasksDocumentRef = db
      .collection("data")
      .doc(groupId)
      .collection("tasks");
    let getTasks = await getTasksData(tasksDocumentRef);
    console.log("getTasks = ", getTasks);
    return getTasks;
    //<-- End read data part -->
  };
};
