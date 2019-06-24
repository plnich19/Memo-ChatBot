const admin = require('firebase-admin');
const serviceAccount = require("./serviceAccountKey.json");
const functions = require('firebase-functions');
const line = require('@line/bot-sdk');

const config = {
    channelAccessToken: 'pBQZX8sq2ilhDSMCpmNSS4bFcalkMiV2JzFbmQTlB9cBL8yNKK6N+1xnDPJ47E0Z6Xei5pz17m+fB+TgVRyilu9rl0Dk7dvtzroqrwGysALVLhwRb1gHUx34PJsA8C2xZhFkT+uLXzKngcWRTWIYblGUYhWQfeY8sLGRXgo3xvw=',
    channelSecret: 'afc9b2ce41f4c642a1c3c3d3700dd395'
};
// create LINE SDK client
const client = new line.Client(config);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://memo-chatbot.firebaseio.com"
  });

let db = admin.firestore();
var userOneDocumentRef = db.collection('users');
// Get the `FieldValue` object
let FieldValue = require('firebase-admin').firestore.FieldValue;

exports.Chatbot = functions.region('asia-east2').https.onRequest(async (req, res) => {

    const reqType = req.body.events[0].type;
    const replyToken = req.body.events[0].replyToken;
    const reqMessage = req.body.events[0].message.text;
    if(reqType === 'message'){
        if(reqMessage === 'เพิ่มเราหน่อย'){
            const groupId = req.body.events[0].source.groupId;
            const userId = req.body.events[0].source.userId;
            const userProfile = await getUserProfileById(userId);
            const welComeMsg = `OK ${userProfile.displayName}`;
            console.log(welComeMsg);
            replyToRoom(groupId,welComeMsg);
            // <---Write data part-->
            dataOneDocumentRef.doc(groupId).collection('members').doc(userId).set({
                displayName: userProfile.displayName,
                pictureUrl: userProfile.pictureUrl,
                role: "Admin"
            })
            .then(function() {
                console.log("Document successfully written!");
                return "OK";
            })
            .catch(function(error) {
                console.error("Error writing document: ", error);
            });
            // <--End write data part-->
        }else if(reqMessage.toLowerCase() === 'getmember'){
            const groupId = req.body.events[0].source.groupId;
            getMembers(groupId);
        }else if(reqMessage.toLowerCase().includes('getmemberprofile')){
            const userSaid = req.body.events[0].message.text;
            const groupId = req.body.events[0].source.groupId;
            getMemberProfile(groupId,userSaid);
        }else if(reqMessage.toLowerCase().includes('create')){
            const userSaid = req.body.events[0].message.text;
            const groupId = req.body.events[0].source.groupId;
            createTask(groupId,userSaid,dataOneDocumentRef);
            replyToRoom(groupId,'สร้าง task ให้เรียบร้อยแล้วน้า');
        }else if(reqMessage.toLowerCase() === 'updateTask'){
            //const userSaid = req.body.events[0].message.text;
            const groupId = req.body.events[0].source.groupId;
            updateTask(groupId);
        }else if(reqMessage.toLowerCase() === 'getTask'){
            const groupId = req.body.events[0].source.groupId;
            getTask(groupId);
        }
        // const userSaid = req.body.events[0].message.text.toLowerCase();
        // var splitText = userSaid.split(" ");
        // if(splitText[0] === "#create"){
        //     //do something
        //     const taskTitle = splitText[1];
        //     console.log("taskTitle = ", taskTitle);
        //     //Check whether there is '@'
        //     if(splitText[2] !== undefined){
        //         if(splitText[2].contains("@")){
        //             var splitText2 = splitText[2].split("@");
        //             console.log("SplitText2 = ", splitText2);
        //             var assignedUser = splitText2[1];
        //             console.log("assignedUser = ", assignedUser);
        //         }
        //         else{
        //             reply(replyToken,'Wrong command');
        //         }
        //     }
        // }else if(splitText[0] === "#display"){
        //     //send picture attached with liff link
        // }
    }else if(reqType === 'join'){
        const groupId = req.body.events[0].source.groupId;
        console.log('join');
        const welComeMsg = `ขอบคุณที่ลากบอทเข้ากรุ๊ป ท่านสามารถใช้คำสั่งได้ดังนี้ 
        - #Create new_task_name @name เพื่อสร้าง task ใหม่ หรือจะแค่ #Create new_task_name ก็ได้ 
        - #display เพื่อให้บอทแสดง task list ของวันนี้`;
        console.log(welComeMsg);
        replyToRoom(groupId,welComeMsg);
        console.log(groupId);
        const memberIds = await getGroupMemberIds(groupId);
        console.log(memberIds);
    }else if(reqType === 'memberJoined'){
        const userId = req.body.events[0].joined.members[0].userId;
        const groupId = req.body.events[0].source.groupId;
        console.log('memberJoined');
        const userProfile = await getUserProfileById(userId);
        const welComeMsg = `ยินดีต้อนรับ ${userProfile.displayName}`;
        console.log(welComeMsg);
        replyToRoom(groupId,welComeMsg);
      }

let getUsers = await getUsersData(userOneDocumentRef);
console.log("getUsers = ",getUsers);
getUsers.forEach(user =>{
    console.log("Users' name = ", user.name);
})

DeleteUserData(userOneDocumentRef);
});

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

const getMembers = async function(groupId){
    // <-- Read data from database part -->
    let membersDocumentRef = db.collection('data').doc(groupId).collection('members');
    let getUsers = await getUsersData(membersDocumentRef);
    console.log("getUsers = ",getUsers);
    replyCorouselToRoom(groupId,getUsers);
    //<-- End read data part -->
}

const getMemberProfile = async function(groupId,userSaid){
    var splitText = userSaid.split("@");
    console.log("splitText = ",splitText);
    // <-- Read data from database part -->
    let FindmembersDocumentRef = db.collection('data').doc(groupId).collection('members').where('displayName','==',splitText[1].trim());
    let getUsers = await getUsersData(FindmembersDocumentRef);
    console.log("getUsers = ",getUsers);
    const listName = await getUsername(getUsers);
    replyCorouselToRoom(groupId,getUsers);
    //<-- End read data part -->
}

const createTask = async function(groupId,userSaid){
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
        assignee: "some ID"
    })
    .then(function() {
        console.log("Task successfully written!");
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

const getTask = async function(groupId){
    // <-- Read data from database part -->
    let tasksDocumentRef = db.collection('data').doc(groupId).collection('task');
    let getTasks = await getUsersData(tasksDocumentRef);
    console.log("getTasks = ",getTasks);
    replyCorouselToRoom(groupId,getTasks);
    //<-- End read data part -->
}
