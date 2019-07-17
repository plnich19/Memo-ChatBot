module.exports = function CronEndpoint({
  functions,
  getLINE_HEADER,
  dataOneDocumentRef,
  getTargetLimitForAdditionalMessages,
  getNumberOfMessagesSentThisMonth,
  getGroupIds,
  getMembersLength,
  getTaskDetailDueDate,
  replyToRoom
}) {
  return functions.region("asia-east2").https.onRequest(async (req, res) => {
    const action = req.query.action;
    const message = req.query.message;
    if (action !== undefined) {
      let getTargetLimit = await getTargetLimitForAdditionalMessages(
        getLINE_HEADER
      )
        .then(res => {
          return res.value;
        })
        .catch(error => {
          console.log("error", error);
        });
      let getNumberMsg = await getNumberOfMessagesSentThisMonth(getLINE_HEADER)
        .then(res => {
          return res.totalUsage;
        })
        .catch(error => {
          console.log("error", error);
        });
      let remain = getTargetLimit - getNumberMsg;
      console.log("getTargetLimit = ", getTargetLimit);
      console.log("getNu,berMsh = ", getNumberMsg);
      console.log("remain = ", remain);
      let GroupsArray = await getGroupIds(dataOneDocumentRef);
      let MembersCount = await getMembersLength(GroupsArray);
      var TotalMembers = Math.max(...MembersCount);
      let MsgUse = TotalMembers + getNumberMsg;

      if (remain >= MsgUse) {
        var today = new Date(Date.now());
        var day = today.getDay();
        if (day === 0 || day === 6) {
          console.log("not weekday");
          if (action === "personalNotice") {
            const ret = { message: "Personal Notice Successfully" };
            console.log("groupsArray = ", GroupsArray);
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
          }
        } else {
          if (action === "broadcastTogroup") {
            GroupsArray.map(groupId => {
              return replyToRoom(groupId, message);
            });
            return res.status(200).send("ผ่าน");
          } else if (action === "broadcastLiff") {
            GroupsArray.map(groupId => {
              return replyLiff(groupId, message);
            });
            return res.status(200).send("ผ่าน");
          } else if (action === "personalNotice") {
            const ret = { message: "Personal Notice Successfully" };
            console.log("groupsArray = ", GroupsArray);
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
                    return "task.userId is mapped";
                  });
                }
                return "TasksArray is mapped";
              });
              return "GroupsArray is mapped";
            });
            return res.status(200).send(ret);
          }
        }
      }
    } else {
      const ret = { message: "action parameter missing" };
      return res.status(400).send(ret);
    }
    return "CronEndpoint running successful";
  });
};
