const admin = require('firebase-admin');
const serviceAccount = require("./serviceAccountKey.json");
const functions = require('firebase-functions');
const line = require('@line/bot-sdk');

// create LINE SDK client
const client = new line.Client(config);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://memo-chatbot.firebaseio.com"
  });

let db = admin.firestore();
var dataOneDocumentRef = db.collection('data');
// Get the `FieldValue` object
let FieldValue = require('firebase-admin').firestore.FieldValue;

exports.addUser = functions.region('asia-east2').https.onRequest(async (req, res) => {

    const reqType = req.body.events[0].type;
    const replyToken = req.body.events[0].replyToken;

    if(reqType === 'message'){
        const userSaid = req.body.events[0].message.text.toLowerCase();
        var splitText = userSaid.split(" ");
        if(splitText[0] === "#create"){
            //do something
            const taskTitle = splitText[1];
            console.log("taskTitle = ", taskTitle);
            //Check whether there is '@'
        }
        else if(splitText[0] === "#display"){
            //send picture attached with liff link
        }
    }else if(reqType === 'join'){
        const groupId = req.body.events[0].source.groupId;
        console.log('join');
        const welComeMsg = `ขอบคุณที่ลากบอทเข้ากรุ๊ป ท่านสามารถใช้คำสั่งได้ดังนี้ 
        - #Create new_task_name @name เพื่อสร้าง task ใหม่ หรือจะแค่ #Create new_task_name ก็ได้ 
        - #display เพื่อให้บอทแสดง task list ของวันนี้`;
        console.log(welComeMsg);
        replyToRoom(groupId,welComeMsg);
        const memberIds = await getGroupMemberIds(groupId);
        console.log(memberIds);
      }

//<---Write data part-->
//getGroupMemberProfile or getuserProfilebyId
//var memberData = [
    //username: req.body.events[0].source.userId,
    //displayName: req.body.events[0].source.displayName,
    //pictureUrl: req.body.events[0].source.pictureUrl,
    //role: 'ADMIN'
//]
// dataOneDocumentRef.doc(groupId).set({
//     title: groupName,
//     members: memberData,
// })
// .then(function() {
//     console.log("Document successfully written!");
//     return "OK";
// })
// .catch(function(error) {
//     console.error("Error writing document: ", error);
// });
//<--End write data part-->

// <-- Read data from database part -->
// let getUsers = await getUsersData(userOneDocumentRef);
// console.log("getUsers = ",getUsers);
// getUsers.forEach(user =>{
//     console.log("Users' name = ", user.name);
// })
// <-- End read data part -->

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

const getUsersData = function(db){
    return db.get()
    .then (snapshot => {
        let UsersArray = [];
        snapshot.forEach(doc => {
        const data = doc.data();
          console.log(doc.id, '=>', data);
          UsersArray.push(data);
        });

        return UsersArray;
    })
};

const DeleteUserData = function(db){
    return db.doc("New Sample UserId").delete();
};

// <-- Database structure -->
// data: {
//     'groupId-fadgeagsdfreasdgfgesdf':{
//       groupData:{
//         title:'groupName',
//         members: [
//           username: 'fjeujnfsdlgmkadherfdmskdlshm',
//           displayName: 'พิช',
//           pictureUrl: 'https://wwfsfsgdf.com/fdsg.jpg',
//           role: 'ADMIN'
//         ]
//       },
//       tasks:[
//         title:'task1',
//         detail: 'detail1',
//         status: 'DONE',
//         assignee: [
//           { 
//             username : 'fjeujnfsdlgmkadherfdmskdlshm'
//           }
//         ]
//       ]
//     }
//   }
// <--End Database structure part -->