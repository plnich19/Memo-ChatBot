const admin = require('firebase-admin');
const serviceAccount = require("./serviceAccountKey.json");
const functions = require('firebase-functions');
const line = require('@line/bot-sdk');

const config = {
    channelAccessToken: 'tEAXSZ6duwf8JcAs49PDPZnDNgk33/KXhWNY5bDhuKZRk5UcNtuE/7hK35biLBFr6Xei5pz17m+fB+TgVRyilu9rl0Dk7dvtzroqrwGysAJZjt2JyNL0eyY9UDxCPJsqw5+sqKZ68ZOJSkGfOXN8y1GUYhWQfeY8sLGRXgo3xvw=',
    channelSecret: 'afc9b2ce41f4c642a1c3c3d3700dd395'
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
        //reply(replyToken,reqMessage);
        if(reqMessage.toLowerCase() === 'getmember'){
            const groupId = req.body.events[0].source.groupId;
            getMembers(replyToken,groupId);
        }else if(reqMessage.toLowerCase().includes('getmemberprofile')){
            const userSaid = req.body.events[0].message.text;
            const groupId = req.body.events[0].source.groupId;
            const writeTask = await getMemberProfile(replyToken,groupId,userSaid,true);
            console.log("WriteTask = ", writeTask);
        }else if(reqMessage.toLowerCase().includes('#create')){
            if(reqMessage.toLowerCase().includes('@')){
              const userSaid = req.body.events[0].message.text;
              const groupId = req.body.events[0].source.groupId;
              const writeTask = await getMemberProfile(replyToken,groupId,userSaid,false);
              console.log("WriteTask = ", writeTask);
              if(writeTask === true){
<<<<<<< Updated upstream
                createTask(groupId,userSaid,dataOneDocumentRef);
                replyToRoom(groupId,'สร้าง task ให้เรียบร้อยแล้วน้า');
=======
                createTask(replyToken,groupId,userSaid);
                replyToRoom(replyToken,groupId,'สร้าง task ให้เรียบร้อยแล้วน้า');
                replyToRoom(replyToken,groupId,'เลือกเวลาไหม');
>>>>>>> Stashed changes
              }
            }
        }else if(reqMessage.toLowerCase() === 'updatetask'){
            const groupId = req.body.events[0].source.groupId;
            updateTask(groupId);
        }else if(reqMessage.toLowerCase() === 'gettask'){
            const groupId = req.body.events[0].source.groupId;
            getTask(replyToken,groupId);
        }else if(reqMessage.toLowerCase() === 'updatemember'){
            const groupId = req.body.events[0].source.groupId;
            const userId = req.body.events[0].source.userId;
            updateMember(groupId,userId);
        }else if(reqMessage.toLowerCase().includes('gettaskdetail')){
          const userSaid = req.body.events[0].message.text;
          const groupId = req.body.events[0].source.groupId;
          getTaskDetail(replyToken,groupId,userSaid);
      }
    }else if(reqType === 'join'){
        const groupId = req.body.events[0].source.groupId;
        console.log('join');
        const welComeMsg = `ขอบคุณที่ลากบอทเข้ากรุ๊ป ท่านสามารถใช้คำสั่งได้ดังนี้ 
        - #Create new_task_name @name เพื่อสร้าง task ใหม่ หรือจะแค่ #Create new_task_name ก็ได้ 
        - #display เพื่อให้บอทแสดง task list ของวันนี้`;
        console.log(welComeMsg);
        replyToRoom(replyToken,groupId,welComeMsg);
        replyConfirmButton(replyToken,groupId);
        // const memberIds = await getGroupMemberIds(groupId);
        // console.log(memberIds);
    }else if(reqType === 'memberJoined'){
        const userId = req.body.events[0].joined.members[0].userId;
        const groupId = req.body.events[0].source.groupId;
        console.log('memberJoined');
        const userProfile = await getUserProfileById(userId);
        const welComeMsg = `ยินดีต้อนรับ ${userProfile.displayName}`;
        console.log(welComeMsg);
        replyToRoom(replyToken,groupId,welComeMsg);
    }else if(reqType === 'postback'){
      const postbackData = req.body.events[0].postback.data;
      if(postbackData === 'confirm'){
        const groupId = req.body.events[0].source.groupId;
        const userId = req.body.events[0].source.userId;
        const userProfile = await getUserProfileById(userId);
        const welComeMsg = `คุณ ${userProfile.displayName} เข้าร่วมการใช้งานแล้ว`;
        console.log(welComeMsg);
        replyToRoom(replyToken,groupId,welComeMsg);
        // <---Write data part-->
        dataOneDocumentRef.doc(groupId).collection('members').doc(userId).set({
            displayName: userProfile.displayName,
            pictureUrl: userProfile.pictureUrl,
            role: "Member"
        })
        .then(function() {
            console.log("Document successfully written!");
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

const replyToRoom = (replyToken,groupId,message) => {
    return client.replyMessage(replyToken, {
    type: 'text',
    text: message
    });
};

const replyCorouselToRoom = (replyToken,groupId,UsersArray) => {
    return client.replyMessage(replyToken, {
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

const replyTaskCorouselToRoom = (replyToken,groupId,TasksArray) => {
    return client.replyMessage(replyToken, {
        type: 'template',
        altText: 'this is a carousel template',
        template: {
          type: 'carousel',
          actions: [],
          columns: TasksArray.map((task) => {
            return {
              title: task.title,
              text: task.status,
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

const replyConfirmButton = (replyToken,groupId) =>{
  return client.replyMessage(replyToken, {
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

<<<<<<< Updated upstream
=======
const replyDatePicker = (replyToken,groupId,TaskId) => {
  return client.replyMessage(replyToken, {
    type: "template",
    altText: "This is a buttons template",
    template: {
        type: "buttons",
        title: "เลือกวันที่",
        text: "เลือกวันจาก datepicker ได้เลย",
        actions: [
          {  
            type:"datetimepicker",
            label:"เลือกวันเวลา",
            data:`TaskId=${TaskId}`,
            mode:"datetime",
            initial:"2017-12-25t00:00",
            max:"2018-01-24t23:59",
            min:"2017-12-25t00:00"
         },
        {
          type: "postback",
          label: "Cancle",
          data: "action=add&itemid=123"
        },
        ]
    }
  });
};

>>>>>>> Stashed changes
const getUsersData = function(db){
    return db.get()
    .then (snapshot => {
        let UsersArray = [];
        snapshot.forEach(doc => {
        const data = doc.data();
          console.log(doc.id, '=>', data);

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

<<<<<<< Updated upstream
=======
const getTasksData = function(db){
  return db.get()
  .then (snapshot => {
      let TasksArray = [];
      snapshot.forEach(doc => {
      const data = doc.data();
        console.log(doc.id, '=>', data);

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

>>>>>>> Stashed changes
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

const getMembers = async function(replyToken,groupId){
    // <-- Read data from database part -->
    let membersDocumentRef = db.collection('data').doc(groupId).collection('members');
    let getUsers = await getUsersData(membersDocumentRef);
    console.log("getUsers = ",getUsers);
    replyCorouselToRoom(replyToken,groupId,getUsers);
    //<-- End read data part -->
}

const getMemberProfile = async function(replyToken,groupId,userSaid,bool){
  var writeTask = true;
  const isEmpty = function(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
  }
    var splitText = userSaid.split("@");
    console.log("splitText = ",splitText);
    // <-- Read data from database part -->
    let FindmembersDocumentRef = db.collection('data').doc(groupId).collection('members').where('displayName','==',splitText[1].trim());
    let getUsers = await getUsersData(FindmembersDocumentRef);
    console.log("getUsers = ",getUsers);
    
    if(isEmpty(getUsers)){
        writeTask = false;
        const replyMsg = `ขออภัยคุณ${splitText[1]}ยังไม่ได้เปิดการใช้งานบอท คุณ${splitText[1]}โปรดยืนยันตัวตนก่อนนะคะ`;
        replyToRoom(replyToken, replyMsg);
        replyConfirmButton(replyToken,replyToken);
    }
    else{
      if(bool){
        replyCorouselToRoom(replyToken,groupId,getUsers);
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

const createTask = async function(replyToken,groupId,userSaid){
    var splitText = userSaid.split(" ");
    console.log("SplitText = ", splitText);
    // if(splitText[2] !== undefined && splitText[2].includes('@')){
    //     var splitTextAgain = splitText[2].split("@");
    //     console.log("splitTextAgain = ",splitTextAgain);
    //     getMemberProfile(groupId,splitTextAgain[1]);
    //     //do something
    // }
    let tasksDocumentRef = db.collection('data').doc(groupId).collection('tasks');
     // <---Write data part-->
     tasksDocumentRef.add({
        title: splitText[1],
        status: "NOT DONE",
<<<<<<< Updated upstream
        assignee: "some ID"
=======
        assignee: "some ID",
        datetime: "",
        createtime: ""
>>>>>>> Stashed changes
    })
    .then(function() {
        console.log("Task successfully written!");
<<<<<<< Updated upstream
=======
        let FindtasksDocumentRef = db.collection('data').doc(groupId).collection('tasks').where('title','==',splitText[1]);
        let getTask = await getTasksData(FindtasksDocumentRef);
        console.log("getTask = ",getTask);
        console.log("taskId = ", getTask[0].TaskId);
        replyDatePicker(replyToken,groupId,getTask[0].TaskId);
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
const getTask = async function(groupId){
=======
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
        });
    }).then(result => {
      console.log('Transaction success!');
      return "OK2";
    }).catch(err => {
      console.log('Transaction failure:', err);
    });
}

const getTask = async function(replyToken,groupId){
>>>>>>> Stashed changes
    // <-- Read data from database part -->
    let tasksDocumentRef = db.collection('data').doc(groupId).collection('tasks');
    let getTasks = await getUsersData(tasksDocumentRef);
    console.log("getTasks = ",getTasks);
    replyTaskCorouselToRoom(replyToken,getTasks);
    //<-- End read data part -->
}

const getTaskDetail = async function(replyToken,groupId,userSaid){
  var splitText = userSaid.split(" ");
  console.log("splitText = ",splitText);
  // <-- Read data from database part -->
  let FindtasksDocumentRef = db.collection('data').doc(groupId).collection('tasks').where('title','==',splitText[1]);
  let getTask = await getUsersData(FindtasksDocumentRef);
  console.log("getTask = ",getTask);
  replyTaskCorouselToRoom(replyToken,getTask);
  //<-- End read data part -->
}

const getTaskDetailbyId = async function(replyToken,groupId,TaskId){

  // <-- Read data from database part -->
  let FindtasksDocumentRef = db.collection('data').doc(groupId).collection('tasks').doc(TaskId);
  let getTask = await getTasksData(FindtasksDocumentRef);
  console.log("getTask = ",getTask);
  replyTaskCorouselToRoom(replyToken,getTask);
  //<-- End read data part -->
}

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