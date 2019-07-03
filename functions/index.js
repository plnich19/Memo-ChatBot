const admin = require('firebase-admin');
const serviceAccount = require("./serviceAccountKey.json");
const functions = require('firebase-functions');
const line = require('@line/bot-sdk');
const request = require('request-promise');

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

// usage : https://asia-east2-memo-chatbot.cloudfunctions.net/DataAPI/?action=getMember&groupId=Ce938b6c2ba40812b0afa36e11078ec56
exports.DataAPI = functions.region('asia-east2').https.onRequest(async (req, res) => {

  res.set('Access-Control-Allow-Origin', "*");
  res.set('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With, Accept');
  
  console.log('req',req);
  console.log('query',req.query);
  const action = req.query.action;
  
  if (action !== undefined ) {
    if(action === 'getMember'){
      const groupId = req.query.groupId;
      if(groupId !== undefined ){
        const rtnData =  await getMembers(groupId);
        return res.status(200).send(JSON.stringify(rtnData));
      }else{
        const ret = { message: 'พังจริง' };
        return res.status(400).send(ret);
      }
    }else if(action === 'getTasks'){
      const groupId = req.query.groupId;
      if(groupId !== undefined ){
        const rtnData =  await getTasks(groupId);
        return res.status(200).send(JSON.stringify(rtnData));
      }else{
        const ret = { message: 'พังจริง' };
        return res.status(400).send(ret);
      }
    }else if(action === 'updateTask'){
      // usage : https://asia-east2-memo-chatbot.cloudfunctions.net/DataAPI/?action=updateTask&groupId=Ce938b6c2ba40812b0afa36e11078ec56&taskId=xxxxxxxx
      const groupId = req.query.groupId;
      const taskId = req.query.taskId;
      const data = req.body;
      if(groupId !== undefined || taskId !== undefined ){
        const rtnData =  await updateTask(groupId,taskId,data);
        return res.status(200).send(JSON.stringify(rtnData));
      }else{
        const ret = { message: 'พังจริง' };
        return res.status(400).send(ret);
      }
    }else if(action === 'deleteTask'){
      // usage : https://asia-east2-memo-chatbot.cloudfunctions.net/DataAPI/?action=deleteTask&groupId=Ce938b6c2ba40812b0afa36e11078ec56&taskId=xxxxxxxx
      const groupId = req.query.groupId;
      const taskId = req.query.taskId;
      if(groupId !== undefined || taskId !== undefined ){
        const rtnData =  await deleteTask(groupId,taskId);
        return res.status(200).send(JSON.stringify(rtnData));
      }else{
        const ret = { message: 'พังจริง' };
        return res.status(400).send(ret);
      }
    }else if(action === 'getYourTask'){
      // usage : https://asia-east2-memo-chatbot.cloudfunctions.net/DataAPI/?action=getYourTask&groupId=Ce938b6c2ba40812b0afa36e11078ec56&userId=xxxxxxxx
      const groupId = req.query.groupId;
      const userId = req.query.userId;
      if(groupId !== undefined || userId !== undefined ){
        const rtnData =  await getYourTask(groupId,userId);
        return res.status(200).send(JSON.stringify(rtnData));
      }else{
        const ret = { message: 'พังจริง' };
        return res.status(400).send(ret);
      }
    }else if(action === 'getTaskDetailNotDone'){
      // usage : https://asia-east2-memo-chatbot.cloudfunctions.net/DataAPI/?action=getTaskDetailNotDone&groupId=Ce938b6c2ba40812b0afa36e11078ec56
      const groupId = req.query.groupId;
      if(groupId !== undefined){
        const rtnData =  await getTaskDetailNotDone(groupId);
        return res.status(200).send(JSON.stringify(rtnData));
      }else{
        const ret = { message: 'พังจริง' };
        return res.status(400).send(ret);
      }
    }
  }else {
    const ret = { message: 'พัง' };
    return res.status(400).send(ret);
  }
});

// usage : https://asia-east2-memo-chatbot.cloudfunctions.net/CronEndpoint/?action=fruit&message=ไปเอาผลไม้จ้า
exports.CronEndpoint = functions.region('asia-east2').https.onRequest(async (req, res) => {
  
    console.log('req',req);
    console.log('query',req.query);
    const action = req.query.action;
    const message = req.query.message;
    if (action !== undefined ) {
      if(action === 'fruit'){
        return request({
          method: `POST`,
          uri: `https://notify-api.line.me/api/notify`,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Bearer bfGLqBR6AizJRwLORuf70f0UeoNlLrU02JTX5ReCBIr`
          },
          body: `message=${message}`
        }).then(() => {
          const ret = { message: 'Done' };
          return res.status(200).send(ret);
        }).catch((error) => {
          const ret = { message: `Sending error: ${error}` };
          return res.status(500).send(ret);
        });
      }
    } else {
      const ret = { message: 'พัง' };
      return res.status(400).send(ret);
    }
    
});

exports.Chatbot = functions.region('asia-east2').https.onRequest(async (req, res) => {
      
    const reqType = req.body.events[0].type;
    const replyToken = req.body.events[0].replyToken;
    if(reqType === 'message'){
      const msgType = req.body.events[0].message.type;
        if(msgType === 'text'){    
          const reqMessage = req.body.events[0].message.text;
          if(reqMessage.toLowerCase() === '#member'){
              const groupId = req.body.events[0].source.groupId;
              const getUsers = await getMembers(groupId);
              replyCorouselToRoom(groupId,getUsers);
          }else if(reqMessage.toLowerCase().includes('getmemberprofile')){
              const userSaid = req.body.events[0].message.text;
              const groupId = req.body.events[0].source.groupId;
              const writeTask = await getMemberProfile(replyToken,groupId,userSaid,true);
          }else if(reqMessage.toLowerCase().includes('#create')){
              if(reqMessage.toLowerCase().includes('@')){
                const userSaid = req.body.events[0].message.text.split('#create')[1];
                console.log("userSaid = ", userSaid);
                const groupId = req.body.events[0].source.groupId;
                //const writeTask = await getMemberProfile(replyToken,groupId,userSaid,false);
                //if(writeTask === true){
                  createTask(replyToken,groupId,userSaid,true);
                //}
              }
              else{
                const userSaid = req.body.events[0].message.text.split("#create")[1];
                const groupId = req.body.events[0].source.groupId;
                createTask(replyToken,groupId,userSaid,false);
              }
          }else if(reqMessage.toLowerCase() === 'updatetask'){
              const groupId = req.body.events[0].source.groupId;
              //updateTask(groupId,taskId);
          }else if(reqMessage.toLowerCase() === 'gettasks' || reqMessage.toLowerCase() === '#display'){
              replyLiff(replyToken);
          }else if(reqMessage.toLowerCase() === 'updatemember'){
              const groupId = req.body.events[0].source.groupId;
              const userId = req.body.events[0].source.userId;
              updateMember(groupId,userId);
          }else if(reqMessage.toLowerCase().includes('gettaskdetail')){
            const groupId = req.body.events[0].source.groupId;
            getTaskDetailNotDone(groupId);
          } 
        }
      }else if(reqType === 'join'){
          const groupId = req.body.events[0].source.groupId;
          const welComeMsg = `สวัสดีค่ะ นี่คือบอท [ชื่อบอท] ขอบคุณที่ลากเข้ากรุ๊ปนะคะ 
           คำแนะนำการใช้งาน
          - สมาชิกในกลุ่มทุกท่านต้องแอดบอทเป็นเพื่อนและกดยืนยันการใช้งานด้านล่าง
           คำสั่ง 
          - #Create [ชื่อ task] #to @name เพื่อสร้าง task ใหม่และมอบหมายงานให้คนๆ นั้น
          - #Create [ชื่อ task] ในกรณีที่ไม่มีผู้รับงานเฉพาะเจาะจง 
          - #display เพื่อให้บอทแสดง task list ของวันนี้ นายท่านสามารถแก้สถานะแล้วก็ข้อมูลของ task ได้ตรงนี้นะคะ`;
          replyToRoom(groupId,welComeMsg);
          replyConfirmButton(groupId);
          // const memberIds = await getGroupMemberIds(groupId);
          // console.log(memberIds);
      }else if(reqType === 'leave'){
        const groupId = req.body.events[0].source.groupId;
        DeleteGroupData(groupId);
      }else if(reqType === 'memberJoined'){
          const userId = req.body.events[0].joined.members[0].userId;
          const groupId = req.body.events[0].source.groupId;
          const userProfile = await getUserProfileById(userId);
          const welComeMsg = `ยินดีต้อนรับ ${userProfile.displayName}`;
          replyToRoom(groupId,welComeMsg);
          replyConfirmButton(groupId);
      }else if(reqType === 'memberLeft'){
        const userId = req.body.events[0].left.members[0].userId;
        const groupId = req.body.events[0].source.groupId;
        DeleteUserData(groupId,userId);
      }else if(reqType === 'postback'){
        const postbackData = req.body.events[0].postback.data;
        if(postbackData === 'confirm'){
          const groupId = req.body.events[0].source.groupId;
          const userId = req.body.events[0].source.userId;
          const userProfile = await getUserProfileById(userId);
          const welComeMsg = `คุณ ${userProfile.displayName} เข้าร่วมการใช้งานแล้ว`;
          reply(replyToken,welComeMsg);
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
          const MakeAdminSplitText = postbackData.split(" ");
          setAdmin(groupId,MakeAdminSplitText);
        }else if(postbackData.includes('taskId=')){
          const groupId = req.body.events[0].source.groupId;
          const splitText = postbackData.split("=");
          const datetime = req.body.events[0].postback.params.datetime;
          updateTime(replyToken,groupId,splitText[1],datetime);
        }else if(postbackData.includes('cancle')){
          reply(replyToken, 'task ถูกสร้างขึ้นเรียบร้อยแล้ว พิมพ์ #display เพื่อดูลิสต์ได้เลยค่ะ')
        }
      } 
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
            label: "ยืนยัน",
            data: "confirm"
          }
        ],
        title: "ยืนยันการใช้งาน",
        text: "คลิกตกลงเพื่อยืนยันตัวตนนะคะ"
      } 
  });
};

const replyDatePicker = (replyToken,groupId,taskId,dateLimit) => {
  return client.pushMessage(groupId, {
    "type": "template",
    "altText": "This is a buttons template",
    "template": {
        "type": "buttons",
        "title": "เลือกวันที่เวลา",
        "text": "เลือกวัน deadline ไหม? ไม่เลือกก็ได้นะ",
        "actions": [
          {  
            "type":"datetimepicker",
            "label":"เลือกวันเวลา",
            "data":`taskId=${taskId}`,
            "mode":"datetime",
            "initial": dateLimit,
            "min":dateLimit
         },
        {
          "type": "postback",
          "label": "Cancle",
          "data": "cancle"
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
          taskId:doc.id,
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

const DeleteUserData = function(groupId,userId){
    let membersDocumentRef = db.collection('data').doc(groupId).collection('members').doc(userId);
    return membersDocumentRef.delete();
};

const DeleteGroupData = function(groupId){
  let groupDocumentRef = db.collection('data').doc(groupId);
  return groupDocumentRef.delete();
};

const getMembers = async function(groupId){
    // <-- Read data from database part -->
    let membersDocumentRef = db.collection('data').doc(groupId).collection('members');
    let getUsers = await getUsersData(membersDocumentRef);
    console.log("(getMembers) getUsers = ",getUsers);
    return getUsers;
    //<-- End read data part -->
}

const getMemberProfile = async function(replyToken,groupId,name,bool){
  var writeTask = true;
  const isEmpty = function(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
          return false;
    }
    return true;
  }
  // var userSaidArray = userSaid.split("@");
  // console.log("(getMemberProfile) userSaidArray = ",userSaidArray);
  // <-- Read data from database part -->
  let FindmembersDocumentRef = db.collection('data').doc(groupId).collection('members').where('displayName','==',name.trim());
  let getMemberProfile = await getUsersData(FindmembersDocumentRef);
  console.log("getMemberProfile = ",getMemberProfile);
    
  if(isEmpty(getMemberProfile)){
    writeTask = false;
    const replyMsg = `ขออภัยคุณ${name}ยังไม่ได้เปิดการใช้งานบอท คุณ${name}โปรดยืนยันตัวตนก่อนนะครับ
    เมื่อคุณ${name}ยืนยันตัวตนแล้ว ให้พิมพ์คำสั่ง #create task ใหม่อีกครั้งครับ`;
    reply(replyToken, replyMsg);
    replyConfirmButton(groupId);

  }
  else{
    if(bool){
      console.log("อะไรไม่รู้วววววววว");
      //replyCorouselToRoom(groupId,getMemberProfile);
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

const createTask = async function(replyToken,groupId,userSaid,bool){
  let assigneeIdArray = [];
  var writeTask;
  var writeTaskArray = [];
  var tasktitle = userSaid.split("#to")[0].trim();
  if(bool){
    var AssigneeString = userSaid.split("#to")[1].trim();
    var assigneeArray = AssigneeString.split(" ");
    var assigneeName = [];
    for(i=0;i<assigneeArray.length;i++){
      assigneeName.push(assigneeArray[i].split('@')[1]);
    }
    const getAssigneeIdArray = async function(assigneeName){
      var getAssigneeData = [];
      assigneeName.forEach(async(name) => {
        writeTask = getMemberProfile(replyToken,groupId,name,true);
        writeTaskArray.push(writeTask);
        let getdb = db.collection('data').doc(groupId).collection('members')
          .where('displayName', '==', name.trim())
          .get();
          getAssigneeData.push(getdb);
          console.log("getAssigneeData = ",getAssigneeData);
      })
      const assigneeIdArray = await Promise.all(getAssigneeData).then((snapshots) => {
        var assigneeIdArray = [];
        snapshots.forEach((querySnapshot) => {
          querySnapshot.docs.map((element) => {
            assigneeIdArray.push(element.id);
          })
        })
        return assigneeIdArray;
      }).catch(err => {
        console.log('Push failure:', err);
      });
      return [assigneeIdArray,writeTaskArray];
    }
    values = await getAssigneeIdArray(assigneeName);
    assigneeIdArray = values[0];
    writeTaskArray = values[1];
  }
  console.log("values =",values);
  console.log("assigneeIdArray = ",assigneeIdArray);
  console.log("writeTaskArray = ",writeTaskArray);
  if(assigneeIdArray.length === assigneeName.length){
    let tasksDocumentRef = db.collection('data').doc(groupId).collection('tasks');
    // <---Write data part-->
    tasksDocumentRef.add({
      title: tasktitle,
      status: "NOT DONE",
      assignee: assigneeIdArray,
      datetime: "",
      createtime: Date.now()
    }).then(async function(result) {
        var date = new Date(Date.now());
        var dateISOString = date.toISOString();
        console.log(dateISOString);
        var splitText = dateISOString.split("T");
        var dateLimit = `${splitText[0]}T00:00`;
          console.log(dateLimit);
          console.log("Task successfully written!");
          replyDatePicker(replyToken,groupId,result.id,dateLimit);
          return "OK";
    }).catch(function(error) {
          console.error("Error writing document: ", error);
    });
    // <--End write data part-->
  }
}

const updateTask = async function(groupId,taskId,data){
  let FindtasksDocumentRef = db.collection('data').doc(groupId).collection('tasks').doc(taskId);
  let transaction = db.runTransaction(t => {
    return t.get(FindtasksDocumentRef)
      .then(doc => {
        t.update(FindtasksDocumentRef, data);
        return "UPDATE";
      });
    }).then(result => {
      console.log('Transaction success!');
      return "OK2";
    }).catch(err => {
      console.log('Transaction failure:', err);
    });
}

const updateTime = function(replyToken,groupId,taskId,datetime){
  let FindtasksDocumentRef = db.collection('data').doc(groupId).collection('tasks').doc(taskId);
  let transaction = db.runTransaction(t => {
    return t.get(FindtasksDocumentRef)
      .then(doc => {
        t.update(FindtasksDocumentRef, {datetime: Date.parse(datetime)});
        return "UPDATE";
      });
  }).then(result => {
    const replyMsg = `อัพเดทเวลาเรียบร้อยแล้ว! 
    พิมพ์ #display เพื่อดูลิสต์`;
    reply(replyToken,replyMsg);
    console.log('Transaction success!');
    return "OK2";
  }).catch(err => {
    console.log('Transaction failure:', err);
  });
}

const getTasks = async function(groupId){
  // <-- Read data from database part -->
  let tasksDocumentRef = db.collection('data').doc(groupId).collection('tasks');
  let getTasks = await getTasksData(tasksDocumentRef);
  console.log("getTasks = ",getTasks);
  return getTasks;
  //<-- End read data part -->
}

const getTaskDetailNotDone = async function(groupId){
  // <-- Read data from database part -->
  const ytdmn = await ytdTimestamp();
  const today = await tdTimestamp();
  let FindtasksDocumentRef = db.collection('data').doc(groupId).collection('tasks').where('status','==','NOT DONE').where('datetime','>',ytdmn).where('datetime','<=',today);
  let getTaskDetail = await getTasksData(FindtasksDocumentRef);
  console.log("getTaskDetail = ",getTaskDetail);
  replyTaskCorouselToRoom(groupId,getTaskDetail);
  //<-- End read data part -->
}

const getYourTask = async function(groupId,userId){
  // <-- Read data from database part -->
  let FindtasksDocumentRef = db.collection('data').doc(groupId).collection('tasks').where('assignee','array-contains',userId);
  let getYourTask = await getTasksData(FindtasksDocumentRef);
  console.log("getYourTask = ",getYourTask);
  return getYourTask;
  //<-- End read data part -->
}

const deleteTask = function(groupId,taskId){
  let  tasksDocumentRef = db.collection('data').doc(groupId).collection('tasks').doc(taskId);
  tasksDocumentRef.delete()
    .then(result => {
      console.log('Delete success!');
      return "OK2";
    }).catch(err => {
      console.log('Delete failure:', err);
    });
}

const setAdmin = async function(groupId, MakeAdminSplitText){
  let FindmembersDocumentRef = db.collection('data').doc(groupId).collection('members').doc(MakeAdminSplitText[2]);
  FindmembersDocumentRef.update({role: "Admin"})
    .then(result => {
      console.log('Transaction success!');
      return "OK2";
    }).catch(err => {
      console.log('Transaction failure:', err);
    });
}

const ytdTimestamp = function(){
  var today = new Date();
  var ytd = today.setDate(today.getDate() - 1);
  var ytdDate = new Date(ytd);
  console.log(ytdDate.toUTCString());
  var ytdTimestamp = ytdDate.setHours(0,0,0,0);
  console.log(ytdTimestamp);
  return ytdTimestamp;
}

const tdTimestamp = function(){
  var now = new Date(Date.now());
  console.log(now);
  var today = now.setHours(0,0,0,0);
  console.log(today);
  return today;
}