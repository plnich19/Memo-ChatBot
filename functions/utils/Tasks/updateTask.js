module.exports = function updateTask(db) {
  return async function(groupId, taskId, data) {
    let FindtasksDocumentRef = db
      .collection("data")
      .doc(groupId)
      .collection("tasks")
      .doc(taskId);
    return (transaction = db.runTransaction(t => {
      return t
        .get(FindtasksDocumentRef)
        .then(doc => {
          const oldData = doc.data();
          let newData = Object.assign({}, oldData, data);
          if (t.update(FindtasksDocumentRef, newData)) {
            return newData;
          }
          return false;
        })
        .then(result => {
          console.log("Transaction success!", result);
          return result;
        })
        .catch(err => {
          console.log("Transaction failure:", err);
          return false;
        });
    }));
  };
};
