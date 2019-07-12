module.exports = function getTasksData(db) {
  return db.get().then(snapshot => {
    let TasksArray = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      console.log("getTasksData = ", doc.id, "=>", data);
      TasksArray.push({
        taskId: doc.id,
        title: data.title,
        status: data.status,
        assignee: data.assignee,
        datetime: data.datetime,
        createtime: data.createtime,
        createby: data.createby
      });
    });
    return TasksArray;
  });
};
