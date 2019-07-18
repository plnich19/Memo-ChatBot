module.exports = function(dependencies) {
  return async function(req, res) {
    console.log("Debugging Personal Notices!");
    const { getTaskDetailDueDate, replyToRoom, GroupsArray } = dependencies;

    const ret = { message: "Personal Notice Successfully" };
    GroupsArray.map(async groupId => {
      const TasksArray = await getTaskDetailDueDate(groupId);
      console.log("ret = ", TasksArray);
      TasksArray.map(task => {
        if (task.userId.length === 0) {
          if (task.condition === "anHour") {
            return replyToRoom(
              task.createby,
              `น้องโน๊ตมาเตือนว่าคุณมีงาน ${
                task.title
              } ที่จะต้องส่งในอีกหนึ่งชมข้างหน้าครับ!`
            );
          } else if (task.condition === "aHalf") {
            return replyToRoom(
              task.createby,
              `คุณมีงาน ${
                task.title
              } ที่จะต้องส่งในอีกครึ่งชั่วโมง! อย่าลืมอัพเดทสถานะงานนะครับ!`
            );
          }
        } else {
          task.userId.map(userId => {
            if (task.condition === "anHour") {
              return replyToRoom(
                userId,
                `น้องโน๊ตมาเตือนว่าคุณมีงาน ${
                  task.title
                } ที่จะต้องส่งในอีกหนึ่งชมข้างหน้าครับ!`
              );
            } else if (task.condition === "aHalf") {
              return replyToRoom(
                userId,
                `คุณมีงาน ${
                  task.title
                } ที่จะต้องส่งในอีกครึ่งชั่วโมง! อย่าลืมอัพเดทสถานะงานนะครับ!`
              );
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
