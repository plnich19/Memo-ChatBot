const admin = require('firebase-admin');
const serviceAccount = require("./serviceAccountKey.json");
const functions = require('firebase-functions');
const line = require('@line/bot-sdk');


const config = {
    channelAccessToken: 'HTK6RpxiRFtlIMDl7s+Klz4WEGz8r0GInSc6ms02dPpWwugI73tRSd/hoKAunXm6KFGBsEVpeTsdwxu9AIRxFaMB+VhJiiKYPEY9Bd3vDP5qYK8X/P1lT/N+kvq01BDfK+ZP7LFniduqFxcRhZgL8AdB04t89/1O/w1cDnyilFU=',
    channelSecret: '3e2bbc2929bf520a6724d65449b6b345'
};

// create LINE SDK client
const client = new line.Client(config);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://memo-chatbot.firebaseio.com"
  });

let db = admin.firestore();
var dataOneDocumentRef = db.collection('data');

exports.Chatbot = functions.region('asia-east2').https.onRequest(async (req, res) => {

    const reqType = req.body.events[0].type;
    const replyToken = req.body.events[0].replyToken;
    if(reqType === 'message'){
        const reqMessage = req.body.events[0].message.text;
        if(reqMessage.toLowerCase() === 'getmember'){
            const groupId = req.body.events[0].source.groupId;
            getMembers(groupId);
        }else if(reqMessage.toLowerCase().includes('getmemberprofile')){
            const userSaid = req.body.events[0].message.text;
            const groupId = req.body.events[0].source.groupId;
            const writeTask = await getMemberProfile(groupId,userSaid,true);
        }else if(reqMessage.toLowerCase().includes('#create')){
            if(reqMessage.toLowerCase().includes('@')){
              const userSaid = req.body.events[0].message.text;
              const groupId = req.body.events[0].source.groupId;
              const writeTask = await getMemberProfile(groupId,userSaid,false);
              if(writeTask === true){
                createTask(groupId,userSaid,dataOneDocumentRef);
                reply(replyToken,'สร้าง task ให้เรียบร้อยแล้วน้า');
              }
            }
        }else if(reqMessage.toLowerCase() === 'updatetask'){
            const groupId = req.body.events[0].source.groupId;
            updateTask(groupId);
        }else if(reqMessage.toLowerCase() === 'gettask' || reqMessage.toLowerCase() === '#display'){
            // const groupId = req.body.events[0].source.groupId;
            // getTask(groupId);
            replyLiff(replyToken);
        }else if(reqMessage.toLowerCase() === 'updatemember'){
            const groupId = req.body.events[0].source.groupId;
            const userId = req.body.events[0].source.userId;
            updateMember(groupId,userId);
        }else if(reqMessage.toLowerCase().includes('gettaskdetail')){
          const userSaid = req.body.events[0].message.text;
          const groupId = req.body.events[0].source.groupId;
          getTaskDetail(groupId,userSaid);
      }
    }else if(reqType === 'join'){
        const groupId = req.body.events[0].source.groupId;
        const welComeMsg = `ขอบคุณที่ลากบอทเข้ากรุ๊ป ท่านสามารถใช้คำสั่งได้ดังนี้ 
        - #Create new_task_name @name เพื่อสร้าง task ใหม่ หรือจะแค่ #Create new_task_name ก็ได้ 
        - #display เพื่อให้บอทแสดง task list ของวันนี้`;
        replyToRoom(groupId,welComeMsg);
        replyConfirmButton(groupId);
        // const memberIds = await getGroupMemberIds(groupId);
        // console.log(memberIds);
    }else if(reqType === 'memberJoined'){
        const userId = req.body.events[0].joined.members[0].userId;
        const groupId = req.body.events[0].source.groupId;
        const userProfile = await getUserProfileById(userId);
        const welComeMsg = `ยินดีต้อนรับ ${userProfile.displayName}`;
        replyToRoom(groupId,welComeMsg);
    }else if(reqType === 'postback'){
      const postbackData = req.body.events[0].postback.data;
      if(postbackData === 'confirm'){
        const groupId = req.body.events[0].source.groupId;
        const userId = req.body.events[0].source.userId;
        const userProfile = await getUserProfileById(userId);
        const welComeMsg = `คุณ ${userProfile.displayName} เข้าร่วมการใช้งานแล้ว`;
        replyToRoom(groupId,welComeMsg);
        // <---Write data part-->
        dataOneDocumentRef.doc(groupId).collection('members').doc(userId).set({
            displayName: userProfile.displayName,
            pictureUrl: userProfile.pictureUrl,
            role: "Member"
        })
        .then(function() {
            console.log("User successfully written!");
            return "OK";
        })
        .catch(function(error) {
            console.error("Error writing document: ", error);
        });
        // <--End write data part-->
      }else if(postbackData.includes('Make admin')){
        const groupId = req.body.events[0].source.groupId;
        const splitText = postbackData.split(" ");
        setAdmin(groupId,splitText);
      }else if(postbackData.includes('TaskId=')){
        const groupId = req.body.events[0].source.groupId;
        const splitText = postbackData.split("=");
        const datetime = req.body.events[0].postback.params.datetime;
        updateTime(groupId,splitText[1],datetime);
      }
    }


//Call delete data function
//DeleteUserData(userOneDocumentRef);
});

const reply = (replyToken,message) => {
    return client.replyMessage(replyToken, {
    type: 'text',
    text: message
    });
};

const replyToRoom = (groupId,message) => {
    return client.pushMessage(groupId, {
    type: 'text',
    text: message
    });
};

const replyCorouselToRoom = (groupId,UsersArray) => {
    return client.pushMessage(groupId, {
        type: 'template',
        altText: 'this is a carousel template',
        template: {
          type: 'carousel',
          actions: [],
          columns: UsersArray.map((member) => {
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
            }
          })
        }
    });
};

const replyTaskCorouselToRoom = (groupId,TasksArray) => {
    return client.pushMessage(groupId, {
        type: 'template',
        altText: 'this is a carousel template',
        template: {
          type: 'carousel',
          actions: [],
          columns: TasksArray.map((task) => {
            return {
              title: task.title,
              text: `Status: ${task.status} Date: ${task.datetime}`,
              actions: [
                {
                  type: "message",
                  label: "Action 1",
                  text: "Action 1"
                }
              ]
            }
          })
        }
    });
};

const replyConfirmButton = (groupId) =>{
  return client.pushMessage(groupId, {
      type: "template",
      altText: "this is a buttons template",
      template: {
        type: "buttons",
        actions: [
          {
            type: "postback",
            label: "ตกลง",
            data: "confirm"
          }
        ],
        title: "ยืนยันการใช้งาน",
        text: "คลิกตกลงเพื่อยืนยันตัวตนนะคะ"
      } 
  });
};

const replyDatePicker = (groupId,TaskId) => {
  return client.pushMessage(groupId, {
    "type": "template",
    "altText": "This is a buttons template",
    "template": {
        "type": "buttons",
        "title": "เลือกวันที่",
        "text": "เลือกวันจาก datepicker ได้เลย",
        "actions": [
          {  
            "type":"datetimepicker",
            "label":"เลือกวันเวลา",
            "data":`TaskId=${TaskId}`,
            "mode":"datetime",
            "initial":"2017-12-25t00:00",
            "max":"2018-01-24t23:59",
            "min":"2017-12-25t00:00"
         },
        {
          "type": "postback",
          "label": "Cancle",
          "data": "action=add&itemid=123"
        },
        ]
    }
  });
};

const replyLiff = (replyToken) => {
  return client.replyMessage(replyToken, {
    "type": "flex",
    "altText": "Flex Message",
    "contents": {
      "type": "bubble",
      "body": {
        "type": "box",
        "layout": "vertical",
        "contents": [
          {
            "type": "box",
            "layout": "vertical",
            "spacing": "sm",
            "margin": "lg",
            "contents": [
              {
                "type": "box",
                "layout": "baseline",
                "spacing": "sm",
                "contents": [
                  {
                    "type": "text",
                    "text": "กดดูลิสต์ข้างล่างได้เลย!",
                    "flex": 5,
                    "size": "sm",
                    "color": "#666666",
                    "wrap": true
                  }
                ]
              }
            ]
          }
        ]
      },
      "footer": {
        "type": "box",
        "layout": "vertical",
        "flex": 0,
        "spacing": "sm",
        "contents": [
          {
            "type": "button",
            "action": {
              "type": "uri",
              "label": "Task list",
              "uri": "line://app/1568521906-qP1vaA4y"
            },
            "height": "sm",
            "style": "link"
          },
          {
            "type": "spacer",
            "size": "sm"
          }
        ]
      }
    }
  });
};


const getUsersData = function(db){
    return db.get()
    .then (snapshot => {
        let UsersArray = [];
        snapshot.forEach(doc => {
        const data = doc.data();
          console.log('getUsersData = ',doc.id, '=>', data);

          UsersArray.push({
            userId:doc.id,
            displayName: data.displayName,
            pictureUrl: data.pictureUrl,
            role: data.role
          });
        });

        return UsersArray;
    })
};

const getTasksData = function(db){
  return db.get()
  .then (snapshot => {
      let TasksArray = [];
      snapshot.forEach(doc => {
      const data = doc.data();
        console.log('getTasksData = ',doc.id, '=>', data);

        TasksArray.push({
          TaskId:doc.id,
          title: data.title,
          status: data.status,
          assignee: data.assignee,
          datetime: data.datetime,
          createtime: data.createtime
        });
      });

      return TasksArray;
  })
};

const getUserProfileById = function(userId) {
  return client.getProfile(userId)
          .catch((err) => {
          console.log('getUserProfile err',err);
          });
};

const getGroupMemberIds = function(userId) {
  return client.getGroupMemberIds(userId)
          .catch((err) => {
          console.log('getGroupMemberIds err',err);
          });
};

const DeleteUserData = function(db){
    return db.doc("New Sample UserId").delete();
};

const getMembers = async function(groupId){
    // <-- Read data from database part -->
    let membersDocumentRef = db.collection('data').doc(groupId).collection('members');
    let getUsers = await getUsersData(membersDocumentRef);
    console.log("(getMembers) getUsers = ",getUsers);
    replyCorouselToRoom(groupId,getUsers);
    //<-- End read data part -->
}

const getMemberProfile = async function(groupId,userSaid,bool){
  var writeTask = true;
  const isEmpty = function(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
  }
    var userSaidArray = userSaid.split("@");
    console.log("(getMemberProfile) userSaidArray = ",userSaidArray);
    // <-- Read data from database part -->
    let FindmembersDocumentRef = db.collection('data').doc(groupId).collection('members').where('displayName','==',userSaidArray[1].trim());
    let getMemberProfile = await getUsersData(FindmembersDocumentRef);
    console.log("getMemberProfile = ",getMemberProfile);
    
    if(isEmpty(getMemberProfile)){
        writeTask = false;
        const replyMsg = `ขออภัยคุณ${userSaidArray[1]}ยังไม่ได้เปิดการใช้งานบอท คุณ${userSaidArray[1]}โปรดยืนยันตัวตนก่อนนะคะ`;
        replyToRoom(groupId, replyMsg);
        replyConfirmButton(groupId);
    }
    else{
      if(bool){
        replyCorouselToRoom(groupId,getMemberProfile);
      }
      else{
        writeTask = true;
      }
    }
    //<-- End read data part -->
    return writeTask;
}

const updateMember = function(groupId,userId){
  let FindmembersDocumentRef = db.collection('data').doc(groupId).collection('members').doc(userId);
  let transaction = db.runTransaction(t => {
      return t.get(FindmembersDocumentRef)
        .then(doc => {
          // Add one person to the city population.
          // Note: this could be done without a transaction
          //       by updating the population using FieldValue.increment()
          t.update(FindmembersDocumentRef, {role: "Member"});
          return "UPDATE";
        });
    }).then(result => {
      console.log('Transaction success!');
      return "OK2";
    }).catch(err => {
      console.log('Transaction failure:', err);
    });
}

const createTask = async function(groupId,userSaid){
    var userSaidArray = userSaid.split(" ");
    console.log("(creatTask) UserSaidArray = ", userSaidArray);
    var assigneeArray = userSaidArray[2].split("@");
    var assigneeName = assigneeArray[1];
    console.log("assigneeName = ", assigneeName);
    
    let FindmembersDocumentRef = db.collection('data').doc(groupId).collection('members').where('displayName','==',assigneeName.trim());
    let getAssigneeData = await getUsersData(FindmembersDocumentRef);
    console.log("getAssigneeData = ",getAssigneeData);
    var assigneeId = getAssigneeData[0].userId;

    let tasksDocumentRef = db.collection('data').doc(groupId).collection('tasks');
     // <---Write data part-->
     tasksDocumentRef.add({
        title: userSaidArray[1],
        status: "NOT DONE",
        assignee: assigneeId,
        datetime: "",
        createtime: Date.now()
    })
    .then(function() {
        console.log("Task successfully written!");
        let FindtasksDocumentRef = db.collection('data').doc(groupId).collection('tasks').where('title','==',userSaidArray[1]);
        let getTask = await getTasksData(FindtasksDocumentRef);
        console.log("taskId = ", getTask[0].TaskId);
        replyDatePicker(groupId,getTask[0].TaskId);
        return "OK";
    })
    .catch(function(error) {
        console.error("Error writing document: ", error);
    });
    // <--End write data part-->
}

const updateTask = async function(groupId){
    let FindtasksDocumentRef = db.collection('data').doc(groupId).collection('tasks').doc('YuqCbuRs8mKH6HHmFaWa');
    let transaction = db.runTransaction(t => {
        return t.get(FindtasksDocumentRef)
          .then(doc => {
            // Add one person to the city population.
            // Note: this could be done without a transaction
            //       by updating the population using FieldValue.increment()
            t.update(FindtasksDocumentRef, {status: "DONE"});
            return "UPDATE";
          });
      }).then(result => {
        console.log('Transaction success!');
        return "OK2";
      }).catch(err => {
        console.log('Transaction failure:', err);
      });
}

const updateTime = function(groupId,TaskId,datetime){
  let FindtasksDocumentRef = db.collection('data').doc(groupId).collection('tasks').doc(TaskId);
  let transaction = db.runTransaction(t => {
      return t.get(FindtasksDocumentRef)
        .then(doc => {
          // Add one person to the city population.
          // Note: this could be done without a transaction
          //       by updating the population using FieldValue.increment()
          t.update(FindtasksDocumentRef, {datetime: datetime});
          return "UPDATE";
        }).then(res =>{
          replyToRoom(groupId,'อะ ลิสต์ล่าสุดจ้า');
          getTask(groupId);
          return "OK";
        })
    }).then(result => {
      
      console.log('Transaction success!');
      return "OK2";
    }).catch(err => {
      console.log('Transaction failure:', err);
    });
}

const getTask = async function(groupId){
    // <-- Read data from database part -->
    let tasksDocumentRef = db.collection('data').doc(groupId).collection('tasks');
    let getTasks = await getUsersData(tasksDocumentRef);
    console.log("getTasks = ",getTasks);
    replyTaskCorouselToRoom(groupId,getTasks);
    //<-- End read data part -->
}

const getTaskDetail = async function(groupId,userSaid){
  var userSaidArray = userSaid.split(" ");
  console.log("splitText = ",userSaid);
  // <-- Read data from database part -->
  let FindtasksDocumentRef = db.collection('data').doc(groupId).collection('tasks').where('title','==',userSaidArray[1]);
  let getTaskDetail = await getTasksData(FindtasksDocumentRef);
  console.log("getTaskDetail = ",getTaskDetail);
  replyTaskCorouselToRoom(groupId,getTaskDetail);
  //<-- End read data part -->
}

// const getTaskDetailbyId = async function(groupId,TaskId){
//   // <-- Read data from database part -->
//   console.log("taskId = ", TaskId);
//   let FindtasksDocumentRef = db.collection('data').doc(groupId).collection('tasks').doc(TaskId);
//   let getTask = await getTasksData(FindtasksDocumentRef);
//   console.log("getTask = ",getTask);
//   replyTaskCorouselToRoom(groupId,getTask);
//   //<-- End read data part -->
// }

const setAdmin = async function(groupId, splitText){
  let FindmembersDocumentRef = db.collection('data').doc(groupId).collection('members').doc(splitText[2]);
  FindmembersDocumentRef.update({role: "Admin"})
  .then(result => {
    console.log('Transaction success!');
    return "OK2";
  }).catch(err => {
    console.log('Transaction failure:', err);
  });
}
