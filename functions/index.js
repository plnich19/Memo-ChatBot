const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");
const functions = require("firebase-functions");
const line = require("@line/bot-sdk");
const request = require("request-promise");
const moment = require("moment");

const config = {
  channelAccessToken:
    "HTK6RpxiRFtlIMDl7s+Klz4WEGz8r0GInSc6ms02dPpWwugI73tRSd/hoKAunXm6KFGBsEVpeTsdwxu9AIRxFaMB+VhJiiKYPEY9Bd3vDP5qYK8X/P1lT/N+kvq01BDfK+ZP7LFniduqFxcRhZgL8AdB04t89/1O/w1cDnyilFU=",
  channelSecret: "3e2bbc2929bf520a6724d65449b6b345"
};

// create LINE SDK client
const client = new line.Client(config);

const getLINE_HEADER = {
  Authorization:
    "Bearer HTK6RpxiRFtlIMDl7s+Klz4WEGz8r0GInSc6ms02dPpWwugI73tRSd/hoKAunXm6KFGBsEVpeTsdwxu9AIRxFaMB+VhJiiKYPEY9Bd3vDP5qYK8X/P1lT/N+kvq01BDfK+ZP7LFniduqFxcRhZgL8AdB04t89/1O/w1cDnyilFU="
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://memo-chatbot.firebaseio.com"
});

let db = admin.firestore();
var dataOneDocumentRef = db.collection("data");

// usage : https://asia-east2-memo-chatbot.cloudfunctions.net/DataAPI/?action=getMember&groupId=Ce938b6c2ba40812b0afa36e11078ec56
exports.DataAPI = functions
  .region("asia-east2")
  .https.onRequest(async (req, res) => {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, OPTIONS");
    res.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, Content-Length, X-Requested-With, Accept"
    );

    console.log("req", req);
    console.log("query", req.query);
    const action = req.query.action;

    if (action !== undefined) {
      if (action === "getMembers") {
        const groupId = req.query.groupId;
        if (groupId !== undefined) {
          const rtnData = await getMembers(groupId);
          return res.status(200).send(JSON.stringify(rtnData));
        } else {
          const ret = { message: "Error getting members" };
          return res.status(400).send(ret);
        }
      } else if (action === "getTasks") {
        const groupId = req.query.groupId;
        if (groupId !== undefined) {
          const rtnData = await getTasks(groupId);
          return res.status(200).send(JSON.stringify(rtnData));
        } else {
          const ret = { message: "Error getting tasks" };
          return res.status(400).send(ret);
        }
      } else if (action === "updateTask") {
        // usage : https://asia-east2-memo-chatbot.cloudfunctions.net/DataAPI/?action=updateTask&groupId=Ce938b6c2ba40812b0afa36e11078ec56&taskId=xxxxxxxx
        const groupId = req.query.groupId;
        const taskId = req.query.taskId;
        const data = req.body;
        if (groupId !== undefined || taskId !== undefined) {
          const rtnData = await updateTask(groupId, taskId, data);
          // console.log('updateTask rtnData',rtnData);
          if (rtnData) {
            return res.status(200).send(JSON.stringify({ result: rtnData }));
          } else {
            const ret = { message: "Fail to update task" };
            return res.status(400).send(ret);
          }
        } else {
          const ret = { message: "Couldn't update--missing parameters" };
          return res.status(400).send(ret);
        }
      } else if (action === "deleteTask") {
        // usage : https://asia-east2-memo-chatbot.cloudfunctions.net/DataAPI/?action=deleteTask&groupId=Ce938b6c2ba40812b0afa36e11078ec56&taskId=xxxxxxxx
        const groupId = req.query.groupId;
        const taskId = req.query.taskId;
        if (groupId !== undefined || taskId !== undefined) {
          const rtnData = await deleteTask(groupId, taskId);
          return res.status(200).send(JSON.stringify(rtnData));
        } else {
          const ret = { message: "Error deleting task" };
          return res.status(400).send(ret);
        }
      } else if (action === "getYourTask") {
        // usage : https://asia-east2-memo-chatbot.cloudfunctions.net/DataAPI/?action=getYourTask&groupId=Ce938b6c2ba40812b0afa36e11078ec56&userId=xxxxxxxx
        const groupId = req.query.groupId;
        const userId = req.query.userId;
        if (groupId !== undefined || userId !== undefined) {
          const rtnData = await getYourTask(groupId, userId);
          return res.status(200).send(JSON.stringify(rtnData));
        } else {
          const ret = { message: "Error getting this userId's tasks" };
          return res.status(400).send(ret);
        }
      } else if (action === "getTaskDetailNotDone") {
        // usage : https://asia-east2-memo-chatbot.cloudfunctions.net/DataAPI/?action=getTaskDetailNotDone&groupId=Ce938b6c2ba40812b0afa36e11078ec56
        const groupId = req.query.groupId;
        if (groupId !== undefined) {
          const rtnData = await getTaskDetailNotDone(groupId);
          return res.status(200).send(JSON.stringify(rtnData));
        } else {
          const ret = { message: "Error getting not done task" };
          return res.status(400).send(ret);
        }
      } else if (action === "getTaskDetailbyDate") {
        // usage : https://asia-east2-memo-chatbot.cloudfunctions.net/DataAPI/?action=getTaskDetailbyDate&groupId=Ce938b6c2ba40812b0afa36e11078ec56&datetime=timestamp
        const groupId = req.query.groupId;
        const datetime = Number(req.query.datetime);
        console.log("datetime = ", datetime);
        if (groupId !== undefined || datetime !== undefined) {
          const rtnData = await getTaskDetailbyDate(groupId, datetime);
          return res.status(200).send(JSON.stringify(rtnData));
        } else {
          const ret = { message: "Error getting tasks by date" };
          return res.status(400).send(ret);
        }
      }
    } else {
      const ret = { message: "action is not defined" };
      return res.status(400).send(ret);
    }
  });

// usage : https://asia-east2-memo-chatbot.cloudfunctions.net/CronEndpoint/?action=fruit&message=ไปเอาผลไม้จ้า
exports.CronEndpoint = functions
  .region("asia-east2")
  .https.onRequest(async (req, res) => {
    const action = req.query.action;
    const message = req.query.message;
    const isEmpty = function (obj) {
      for (var key in obj) {
        if (obj.hasOwnProperty(key)) return false;
      }
      return true;
    };
    if (action !== undefined) {
      let getTargetLimit = await getTargetLimitForAdditionalMessages()
        .then(res => {
          return res.value;
        })
        .catch(error => {
          console.log("error", error);
        });
      let getNumberMsg = await getNumberOfMessagesSentThisMonth()
        .then(res => {
          return res.totalUsage;
        })
        .catch(error => {
          console.log("error", error);
        });
      let remain = getTargetLimit - getNumberMsg;
      let GroupsArray = await getGroupIds(dataOneDocumentRef);
      let MembersCount = await getMembersLength(GroupsArray);
      var TotalMembers = Math.max(...MembersCount);
      let MsgUse = TotalMembers + getNumberMsg;

      if (remain >= MsgUse) {
        var today = new Date(Date.now());
        var day = today.getDay();
        if (day === 0 || day === 6) {
          console.log("not weekday");
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
            const ret = { message: "OK" };
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
                  });
                }
              });
            });
            return res.status(200).send("OK");
          }
        }
      }
    } else {
      const ret = { message: "action parameter missing" };
      return res.status(400).send(ret);
    }
  });

exports.Chatbot = functions
  .region("asia-east2")
  .https.onRequest(async (req, res) => {
    const reqType = req.body.events[0].type;
    console.log("reqType = ", reqType);
    const replyToken = req.body.events[0].replyToken;
    console.log("replyToken = ", replyToken);
    if (reqType === "message") {
      const msgType = req.body.events[0].message.type;
      if (msgType === "text") {
        let reqMessage = req.body.events[0].message.text || "";
        if (reqMessage !== "") {
          reqMessage = reqMessage.replace("#Create", "#create");
        }
        if (reqMessage.toLowerCase() === "#member") {
          const groupId = req.body.events[0].source.groupId;
          const getUsers = await getMembers(groupId);
          replyCorouselToRoom(groupId, getUsers);
        } else if (reqMessage.toLowerCase().includes("getmemberprofile")) {
          const userSaid = req.body.events[0].message.text;
          const groupId = req.body.events[0].source.groupId;
          const writeTask = await getMemberProfile(groupId, userSaid, true);
        } else if (reqMessage.includes("#create")) {
          if (reqMessage.includes("@")) {
            const userSaid = reqMessage.split("#create")[1];
            console.log("userSaid = ", userSaid);
            const groupId = req.body.events[0].source.groupId;
            const userId = req.body.events[0].source.userId;
            createTask(replyToken, groupId, userId, userSaid, true);
          } else {
            const userSaid = reqMessage.split("#create")[1];
            const groupId = req.body.events[0].source.groupId;
            const userId = req.body.events[0].source.userId;
            createTask(replyToken, groupId, userId, userSaid, false);
          }
        } else if (reqMessage.toLowerCase() === "updatetask") {
          const groupId = req.body.events[0].source.groupId;
          //updateTask(groupId,taskId);
        } else if (
          reqMessage.toLowerCase() === "gettasks" ||
          reqMessage.toLowerCase() === "#display"
        ) {
          const groupId = req.body.events[0].source.groupId;
          replyLiff(groupId, "กดดูลิสต์ข้างล่างได้เลย!");
        } else if (reqMessage.toLowerCase() === "updatemember") {
          const groupId = req.body.events[0].source.groupId;
          const userId = req.body.events[0].source.userId;
          updateMember(groupId, userId);
        } else if (reqMessage.toLowerCase().includes("gettaskdetail")) {
          const groupId = req.body.events[0].source.groupId;
          getTaskDetailNotDone(groupId);
        }
      }
    } else if (reqType === "join") {
      const groupId = req.body.events[0].source.groupId;
      const welComeMsg = `สวัสดีครับ น้องโน๊ตขอขอบคุณที่ท่านแอดน้องโน๊ตเข้ากลุ่ม
           คำแนะนำการใช้งานน้องโน๊ต
          - สมาชิกในกลุ่มทุกท่านต้องแอดน้องโน๊ตเป็นเพื่อนและกดยืนยันการใช้งานด้านล่างด้วยครับ
           คำสั่ง 
          - #Create [ชื่อ task] #to @name เพื่อสร้าง task ใหม่และมอบหมายงานให้คนๆ นั้น
          - #Create [ชื่อ task] ในกรณีที่ไม่มีผู้รับงานเฉพาะเจาะจง 
          - #display เพื่อให้บอทแสดง task list ของวันนี้ นายท่านสามารถแก้สถานะแล้วก็ข้อมูลของ task ได้ตรงนี้นะครับ`;
      replyToRoom(groupId, welComeMsg);
      replyConfirmButton(replyToken);
      // const memberIds = await getGroupMemberIds(groupId);
      // console.log(memberIds);
    } else if (reqType === "leave") {
      const groupId = req.body.events[0].source.groupId;
      DeleteGroupData(groupId);
    } else if (reqType === "memberJoined") {
      const userId = req.body.events[0].joined.members[0].userId;
      const groupId = req.body.events[0].source.groupId;
      const userProfile = await getUserProfileById(userId);
      const welComeMsg = `ยินดีต้อนรับ ${userProfile.displayName}
          คำแนะนำการใช้งานน้องโน๊ต
          - คุณ ${
        userProfile.displayName
        } โปรดกดยืนยันการใช้งานน้องโน๊ตด้านล่างด้วยนะครับ
          คำสั่ง
          - #Create [ชื่อ task] #to @name เพื่อสร้าง task ใหม่และมอบหมายงานให้คนๆ นั้น
          - #Create [ชื่อ task] ในกรณีที่ไม่มีผู้รับงานเฉพาะเจาะจง 
          - #display เพื่อให้บอทแสดง task list ของวันนี้ นายท่านสามารถแก้สถานะแล้วก็ข้อมูลของ task ได้ตรงนี้นะครับ`;
      replyToRoom(groupId, welComeMsg);
      replyConfirmButton(replyToken);
    } else if (reqType === "memberLeft") {
      const userId = req.body.events[0].left.members[0].userId;
      const groupId = req.body.events[0].source.groupId;
      DeleteUserData(groupId, userId);
    } else if (reqType === "follow") {
      const groupId = req.body.events[0].source.userId;
      const welComeMsg = `สวัสดีครับ นี่คือน้องโน๊ตเองครับ 
         คำแนะนำการใช้งาน
        - แอดน้องโน๊ตเข้ากลุ่มเพื่อใช้งานนะครับ
         คำสั่ง 
        - #Create [ชื่อ task] #to @name เพื่อสร้าง task ใหม่และมอบหมายงานให้คนๆ นั้น
        - #Create [ชื่อ task] ในกรณีที่ไม่มีผู้รับงานเฉพาะเจาะจง 
        - #display เพื่อให้บอทแสดง task list ของวันนี้ นายท่านสามารถแก้สถานะแล้วก็ข้อมูลของ task ได้ตรงนี้นะครับ`;
      reply(replyToken, welComeMsg);
    } else if (reqType === "postback") {
      const postbackData = req.body.events[0].postback.data;
      if (postbackData === "confirm") {
        const groupId = req.body.events[0].source.groupId;
        const userId = req.body.events[0].source.userId;
        const userProfile = await getUserProfileById(userId);
        const welComeMsg = `คุณ ${
          userProfile.displayName
          } เข้าร่วมการใช้งานแล้ว`;
        reply(replyToken, welComeMsg);
        // <---Write data part-->
        dataOneDocumentRef
          .doc(groupId)
          .collection("members")
          .doc(userId)
          .set({
            displayName: userProfile.displayName,
            pictureUrl: userProfile.pictureUrl,
            role: "Member"
          })
          .then(() => {
            console.log("User successfully written!");
            return "OK";
          })
          .catch(error => {
            console.error("Error writing document: ", error);
          });
        // <--End write data part-->
      } else if (postbackData.includes("Make admin")) {
        const groupId = req.body.events[0].source.groupId;
        const MakeAdminSplitText = postbackData.split(" ");
        setAdmin(groupId, MakeAdminSplitText);
      } else if (postbackData.includes("taskId=")) {
        const groupId = req.body.events[0].source.groupId;
        const splitText = postbackData.split("=");
        const datetime = req.body.events[0].postback.params.datetime;
        updateTime(replyToken, groupId, splitText[1], datetime);
      } else if (postbackData.includes("cancel")) {
        const groupId = req.body.events[0].source.groupId;
        const splitText = postbackData.split("=");
        let FindtasksDocumentRef = db
          .collection("data")
          .doc(groupId)
          .collection("tasks")
          .doc(splitText[1]);
        FindtasksDocumentRef.get()
          .then(async doc => {
            let docdata = doc.data();
            let assigneearray = [];
            const assigneeArray = async function (assignee) {
              const arraypromise = await assignee.map(async userId => {
                const displayName = await getMemberProfilebyId(groupId, userId);
                assigneearray.push(displayName);
                return assigneearray;
              });
              const assigneeArray = await Promise.all(arraypromise);
              return assigneeArray;
            };
            const assigneeArrayRes = await assigneeArray(docdata.assignee);
            const replyMsg = `Title : ${docdata.title} 
Due Date : No Duedate 
Assignee : ${assigneeArrayRes[0].join()}

ถูกสร้างขึ้นเรียบร้อยแล้ว! 
พิมพ์ #display เพื่อดูลิสต์เต็มๆ ได้เลยครับ`;
            reply(replyToken, replyMsg);
            return "reply successfully";
          })
          .catch(err => {
            console.log("พัง", err);
          });
      }
    }
  });

const reply = (replyToken, message) => {
  return client.replyMessage(replyToken, {
    type: "text",
    text: message
  });
};

const replyToRoom = (groupId, message) => {
  return client.pushMessage(groupId, {
    type: "text",
    text: message
  });
};

const replyCorouselToRoom = (groupId, UsersArray) => {
  return client.pushMessage(groupId, {
    type: "template",
    altText: "this is a carousel template",
    template: {
      type: "carousel",
      actions: [],
      columns: UsersArray.map(member => {
        return {
          thumbnailImageUrl: member.pictureUrl,
          title: member.displayName,
          text: member.role,
          actions: [
            {
              type: "postback",
              label: "Make admin",
              data: `Make admin ${member.userId}`
            }
          ]
        };
      })
    }
  });
};

const replyTaskCorouselToRoom = (groupId, TasksArray) => {
  return client.pushMessage(groupId, {
    type: "template",
    altText: "this is a carousel template",
    template: {
      type: "carousel",
      actions: [],
      columns: TasksArray.map(task => {
        var event = new Date(task.datetime);
        var date = event.toDateString();
        return {
          title: task.title,
          text: `Status: ${task.status} Date: ${date}`,
          actions: [
            {
              type: "message",
              label: "Action 1",
              text: "Action 1"
            }
          ]
        };
      })
    }
  });
};

const replyConfirmButton = replyToken => {
  return client.replyMessage(replyToken, {
    type: "template",
    altText: "this is a buttons template",
    template: {
      type: "buttons",
      actions: [
        {
          type: "postback",
          label: "ยืนยัน",
          data: "confirm"
        }
      ],
      title: "ยืนยันการใช้งาน",
      text: "คลิกยืนยันเพื่อยืนยันตัวตนนะครับ"
    }
  });
};

const replyDatePicker = (replyToken, groupId, taskId, dateLimit) => {
  return client.pushMessage(groupId, {
    type: "template",
    altText: "This is a buttons template",
    template: {
      type: "buttons",
      title: "เลือกวันที่เวลา",
      text: "เลือกวัน deadline ไหม? ไม่เลือกก็ได้นะ",
      actions: [
        {
          type: "datetimepicker",
          label: "เลือกวันเวลา",
          data: `taskId=${taskId}`,
          mode: "datetime",
          initial: dateLimit,
          min: dateLimit
        },
        {
          type: "postback",
          label: "Cancel",
          data: `cancel=${taskId}`
        }
      ]
    }
  });
};

const replyLiff = (groupId, message) => {
  return client.pushMessage(groupId, {
    type: "flex",
    altText: message,
    contents: {
      type: "bubble",
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "box",
            layout: "vertical",
            spacing: "sm",
            margin: "lg",
            contents: [
              {
                type: "box",
                layout: "baseline",
                spacing: "sm",
                contents: [
                  {
                    type: "text",
                    text: message,
                    flex: 5,
                    size: "sm",
                    color: "#666666",
                    wrap: true
                  }
                ]
              }
            ]
          }
        ]
      },
      footer: {
        type: "box",
        layout: "vertical",
        flex: 0,
        spacing: "sm",
        contents: [
          {
            type: "button",
            action: {
              type: "uri",
              label: "Task list",
              uri: "line://app/1568521906-qP1vaA4y"
            },
            height: "sm",
            style: "link"
          },
          {
            type: "spacer",
            size: "sm"
          }
        ]
      }
    }
  });
};

const getUsersData = function (db) {
  return db.get().then(snapshot => {
    let UsersArray = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      console.log("getUsersData = ", doc.id, "=>", data);

      UsersArray.push({
        userId: doc.id,
        displayName: data.displayName,
        pictureUrl: data.pictureUrl,
        role: data.role
      });
    });
    return UsersArray;
  });
};

const getTasksData = function (db) {
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

const getGroupIds = function (db) {
  return db.get().then(snapshot => {
    let GroupsArray = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      console.log("getGroupsData = ", doc.id, "=>", data);

      GroupsArray.push(doc.id);
    });

    return GroupsArray;
  });
};

const getUserProfileById = function (userId) {
  return client.getProfile(userId).catch(err => {
    console.log("getUserProfile err", err);
  });
};

const getGroupMemberIds = function (userId) {
  return client.getGroupMemberIds(userId).catch(err => {
    console.log("getGroupMemberIds err", err);
  });
};

const getTargetLimitForAdditionalMessages = bodyResponse => {
  return request({
    method: `GET`,
    uri: `https://api.line.me/v2/bot/message/quota`,
    headers: getLINE_HEADER,
    json: true
  }).then(response => {
    return response;
  });
};

const getNumberOfMessagesSentThisMonth = bodyResponse => {
  return request({
    method: `GET`,
    uri: `https://api.line.me/v2/bot/message/quota/consumption`,
    headers: getLINE_HEADER,
    json: true
  }).then(response => {
    return response;
  });
};

const DeleteUserData = function (groupId, userId) {
  let membersDocumentRef = db
    .collection("data")
    .doc(groupId)
    .collection("members")
    .doc(userId);
  return membersDocumentRef.delete();
};

const DeleteGroupData = function (groupId) {
  let groupDocumentRef = db.collection("data").doc(groupId);
  return groupDocumentRef.delete();
};

const getMembers = async function (groupId) {
  // <-- Read data from database part -->
  let membersDocumentRef = db
    .collection("data")
    .doc(groupId)
    .collection("members");
  let getUsers = await getUsersData(membersDocumentRef);
  console.log("(getMembers) getUsers = ", getUsers);
  return getUsers;
  //<-- End read data part -->
};

const getMembersLength = async function (GroupsArray) {
  var MembersCount = 0;
  console.log("type of MembersCount = ", typeof MembersCount);

  const total = GroupsArray.map(async groupId => {
    const getUsers = await getMembers(groupId);
    console.log("getUsers = ", getUsers);
    var size = Number(Object.keys(getUsers).length);
    console.log("size = ", size);
    console.log("type of size = ", typeof size);
    MembersCount = MembersCount + size;
    console.log("MembersCount ใน map = ", MembersCount);
    return MembersCount;
  });
  const total2 = await Promise.all(total);
  console.log("MembersCount นอก map = ", total2);
  return total2;
};

const getMemberProfile = async function (groupId, name, bool) {
  var writeTask = true;
  const isEmpty = function (obj) {
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) return false;
    }
    return true;
  };
  // var userSaidArray = userSaid.split("@");
  // console.log("(getMemberProfile) userSaidArray = ",userSaidArray);
  // <-- Read data from database part -->
  let FindmembersDocumentRef = db
    .collection("data")
    .doc(groupId)
    .collection("members")
    .where("displayName", "==", name.trim());
  let getMemberProfile = await getUsersData(FindmembersDocumentRef);
  console.log("getMemberProfile = ", getMemberProfile);

  if (isEmpty(getMemberProfile)) {
    writeTask = false;
    const replyMsg = `ขออภัยคุณ${name}ยังไม่ได้เปิดการใช้งานบอท คุณ${name}โปรดยืนยันตัวตนก่อนนะครับ
    เมื่อคุณ${name}ยืนยันตัวตนแล้ว ให้พิมพ์คำสั่ง #create task ใหม่อีกครั้งครับ`;
    replyToRoom(groupId, replyMsg);
    // replyConfirmButton(groupId);
  } else {
    if (bool) {
      replyCorouselToRoom(groupId, getMemberProfile);
    } else {
      writeTask = true;
    }
  }
  //<-- End read data part -->
  return writeTask;
};

const getMemberProfilebyId = async function (groupId, userId) {
  //<-- Read Document Part-->
  const getDisplayName = function (db) {
    return db
      .get()
      .then(doc => {
        docdata = doc.data();
        return docdata.displayName;
      })
      .catch(err => {
        console.log("Error getting document:", err);
      });
  };
  //<--End Read Document Part-->
  let FindmembersDocumentRef = db
    .collection("data")
    .doc(groupId)
    .collection("members")
    .doc(userId);
  const displayName = await getDisplayName(FindmembersDocumentRef);
  console.log("displayName นอก = ", displayName);
  return displayName;
};

const updateMember = function (groupId, userId) {
  let FindmembersDocumentRef = db
    .collection("data")
    .doc(groupId)
    .collection("members")
    .doc(userId);
  let transaction = db
    .runTransaction(t => {
      return t.get(FindmembersDocumentRef).then(doc => {
        t.update(FindmembersDocumentRef, { role: "Member" });
        return "UPDATE";
      });
    })
    .then(result => {
      console.log("Transaction success!");
      return "OK2";
    })
    .catch(err => {
      console.log("Transaction failure:", err);
    });
};

const createTask = async function (replyToken, groupId, userId, userSaid, bool) {
  let assigneeIdArray = [];
  var assigneeName = [];
  var tasktitle = userSaid.split("#to")[0].trim();
  var onlyone;
  if (bool) {
    onlyone = false;
    var AssigneeString = userSaid.split("#to")[1].trim();
    var assigneeArray = AssigneeString.split(" ");
    for (i = 0; i < assigneeArray.length; i++) {
      if (assigneeArray[i].includes("@")) {
        assigneeName.push(assigneeArray[i].split("@")[1]);
      }
    }
    const getAssigneeIdArray = async function (assigneeName) {
      var getAssigneeData = [];
      assigneeName.forEach(async name => {
        getMemberProfile(groupId, name, false);
        let getdb = db
          .collection("data")
          .doc(groupId)
          .collection("members")
          .where("displayName", "==", name.trim())
          .get();
        getAssigneeData.push(getdb);
        console.log("getAssigneeData = ", getAssigneeData);
      });
      const assigneeIdArray = await Promise.all(getAssigneeData)
        .then(snapshots => {
          var assigneeIdArray = [];
          snapshots.forEach(querySnapshot => {
            querySnapshot.docs.map(element => {
              assigneeIdArray.push(element.id);
            });
          });
          return assigneeIdArray;
        })
        .catch(err => {
          console.log("Push failure:", err);
        });
      return assigneeIdArray;
    };
    assigneeIdArray = await getAssigneeIdArray(assigneeName);
  } else {
    onlyone = true;
  }
  if (assigneeIdArray.length === assigneeName.length) {
    if (onlyone === true) {
      assigneeIdArray.push(userId);
    }
    let tasksDocumentRef = db
      .collection("data")
      .doc(groupId)
      .collection("tasks");
    // <---Write data part-->
    tasksDocumentRef
      .add({
        title: tasktitle,
        status: false,
        assignee: assigneeIdArray,
        datetime: "",
        createtime: Date.now(),
        createby: userId
      })
      .then(async result => {
        var date = new Date(Date.now());
        var dateISOString = date.toISOString();
        console.log(dateISOString);
        var splitText = dateISOString.split("T");
        var dateLimit = `${splitText[0]}T00:00`;
        console.log(dateLimit);
        console.log("Task successfully written!");
        replyDatePicker(replyToken, groupId, result.id, dateLimit);
        return "OK";
      })
      .catch(error => {
        console.error("Error writing document: ", error);
      });
    // <--End write data part-->
  } else {
    replyConfirmButton(replyToken);
  }
};

const updateTask = async function (groupId, taskId, data) {
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

const updateTime = function (replyToken, groupId, taskId, datetime) {
  var dateParse = Date.parse(datetime);
  const HOUR = 7 * 1000 * 60 * 60;
  let datetimeUpdate = dateParse - HOUR;
  let FindtasksDocumentRef = db
    .collection("data")
    .doc(groupId)
    .collection("tasks")
    .doc(taskId);
  let transaction = db
    .runTransaction(t => {
      return t.get(FindtasksDocumentRef).then(doc => {
        t.update(FindtasksDocumentRef, { datetime: datetimeUpdate });
        return FindtasksDocumentRef;
      });
    })
    .then(result => {
      const FindtasksDocumentRefRes = FindtasksDocumentRef.get();
      return FindtasksDocumentRefRes;
    })
    .then(async doc => {
      let docdata = doc.data();
      console.log("doc.data = ", doc.data());
      var date = moment(docdata.datetime + 7 * 1000 * 60 * 60).format(
        "MMMM Do YYYY, h:mm a"
      );
      let assigneearray = [];
      const assigneeArray = async function (assignee) {
        const arraypromise = await assignee.map(async userId => {
          const displayName = await getMemberProfilebyId(groupId, userId);
          assigneearray.push(displayName);
          return assigneearray;
        });
        const assigneeArray = await Promise.all(arraypromise);
        return assigneeArray;
      };
      const assigneeArrayRes = await assigneeArray(docdata.assignee);
      console.log("assigneeArrayRes", assigneeArrayRes);
      console.log("assigneeArrayRes.join() = ", assigneeArrayRes[0].join());
      const replyMsg = `Title : ${docdata.title} 
Due Date : ${date} 
Assignee : ${assigneeArrayRes[0].join()}

ถูกสร้างเรียบร้อยแล้ว! 
พิมพ์ #display เพื่อดูลิสต์เต็มๆ ได้เลยครับ`;
      reply(replyToken, replyMsg);
      console.log("Transaction success!");
      return "find successfully";
    })
    .catch(err => {
      console.log("พัง", err);
    });
};

const getTasks = async function (groupId) {
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

const getTaskDetailNotDone = async function (groupId) {
  // <-- Read data from database part -->
  const yesterday = await ytdTimestamp();
  const today = await tdTimestamp();
  let FindtasksDocumentRef = db
    .collection("data")
    .doc(groupId)
    .collection("tasks")
    .where("status", "==", false)
    .where("datetime", ">=", yesterday)
    .where("datetime", "<", today);
  let getTaskDetail = await getTasksData(FindtasksDocumentRef);
  console.log("getTaskDetail = ", getTaskDetail);
  return getTaskDetail;
  //<-- End read data part -->
};

const getTaskDetailDueDate = async function (groupId) {
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
  //console.log("getTaskDetail = ", getTaskDetail);
  await getTaskDetail.map(task => {
    if (task.datetime === anHourLater) {
      TasksArray.push({
        condition: "anHour",
        userId: task.assignee,
        title: task.title,
        createby: task.createby
      });
    } else if (task.datetime === aHalfLater) {
      TasksArray.push({
        condition: "aHalf",
        userId: task.assignee,
        title: task.title,
        createby: task.createby
      });
    }
  });
  console.log("TasksArray = ", TasksArray);
  return TasksArray;
  //<-- End read data part -->};
};

const getTaskDetailbyDate = async function (groupId, datetime) {
  // <-- Read data from database part -->
  const yesterday = await ytdTimestampbyDate(datetime);
  const today = await tdTimestampbyDate(datetime);
  let FindtasksDocumentRef = db
    .collection("data")
    .doc(groupId)
    .collection("tasks")
    .where("datetime", ">=", yesterday)
    .where("datetime", "<", today);
  let getTaskDetail = await getTasksData(FindtasksDocumentRef);
  console.log("getTaskDetail = ", getTaskDetail);
  return getTaskDetail;
  //<-- End read data part -->
};

const getYourTask = async function (groupId, userId) {
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

const deleteTask = function (groupId, taskId) {
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

const setAdmin = async function (groupId, MakeAdminSplitText) {
  let FindmembersDocumentRef = db
    .collection("data")
    .doc(groupId)
    .collection("members")
    .doc(MakeAdminSplitText[2]);
  FindmembersDocumentRef.update({ role: "Admin" })
    .then(result => {
      console.log("Transaction success!");
      return "Role updated";
    })
    .catch(err => {
      console.log("Transaction failure:", err);
    });
};

const ytdTimestamp = function () {
  var ytd = new Date();
  var ytdTimestamp = ytd.setUTCHours(0, 0, 0, 0);
  return ytdTimestamp;
};

const tdTimestamp = function () {
  var td = new Date();
  var tdTimestamp = td.setUTCHours(0, 0, 0, 0);
  return tdTimestamp;
};

const ytdTimestampbyDate = function (datetime) {
  var date = new Date(datetime);
  var ytdTimestampbyDate = date.setHours(0, 0, 0, 0);
  return ytdTimestampbyDate;
};

const tdTimestampbyDate = function (datetime) {
  var td = new Date(datetime);
  var tdTimestampbyDate = td.setUTCHours(0, 0, 0, 0);
  return tdTimestampbyDate;
};

const anHourLaterTimestamp = function () {
  const HOUR = 1000 * 60 * 60;
  var anHourLater = Date.now() + HOUR;
  var anHourLaterDate = new Date(anHourLater);
  var anHourLaterParse = Date.parse(anHourLaterDate);
  var anHourLaterTimestamp = new Date(anHourLaterParse).setSeconds(0);
  console.log(new Date(anHourLaterTimestamp));
  return anHourLaterTimestamp;
};

const ThirtyMinsLaterTimestamp = function () {
  const HALF = 1000 * 60 * 30;
  var aHalfLater = Date.now() + HALF;
  var aHalfLaterDate = new Date(new Date(aHalfLater));
  var aHalfLaterParse = Date.parse(aHalfLaterDate);
  var aHalfLaterTimestamp = new Date(aHalfLaterParse).setSeconds(0);
  console.log(new Date(aHalfLaterTimestamp));
  return aHalfLaterTimestamp;
};
