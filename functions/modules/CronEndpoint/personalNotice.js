module.exports = function(dependencies) {
  return async function(req, res) {
    console.log("Debugging Personal Notices!");
    const { getTaskDetailDueDate, replyToRoom, GroupsArray } = dependencies;

    const ret = { message: "Personal Notice Successfully" };
    GroupsArray.map(async groupId => {
      const TasksArray = await getTaskDetailDueDate(groupId);
      console.log("ret = ", TasksArray);
      const anHour = function(id, title) {
        return replyToRoom(
          id,
          `น้องโน๊ตมาเตือนว่าคุณมีงาน ${title} ที่จะต้องส่งในอีกหนึ่งชมข้างหน้าครับ!`
        );
      };
      const aHalf = function(id, title) {
        return replyToRoom(
          id,
          `คุณมีงาน ${title} ที่จะต้องส่งในอีกครึ่งชั่วโมง! อย่าลืมอัพเดทสถานะงานนะครับ!`
        );
      };
      TasksArray.map(task => {
        if (task.userId.length === 0) {
          if (task.condition === "anHour") {
            return anHour(task.createby, task.title);
          } else if (task.condition === "aHalf") {
            return anHalf(task.createby, task.title);
          }
        } else {
          task.userId.map(userId => {
            if (task.condition === "anHour") {
              return anHour(userId, task.title);
            } else if (task.condition === "aHalf") {
              return aHalf(userId, task.title);
            }
            return "Task.userID is mapped";
          });
        }
        return "TasksArray is mapped";
      });
    });
    return res.status(200).send(ret);
  };
};
