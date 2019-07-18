module.exports = function deleteTask(db) {
  return function(groupId, taskId) {
    let tasksDocumentRef = db
      .collection("data")
      .doc(groupId)
      .collection("tasks")
      .doc(taskId);
    tasksDocumentRef
      .delete()
      .then(result => {
        console.log("Delete success!");
        return "Delete Success!";
      })
      .catch(err => {
        console.log("Delete failure:", err);
        return "Delete Failure!";
      });
  };
};
