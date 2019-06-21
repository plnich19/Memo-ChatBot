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
var userOneDocumentRef = db.collection('users');
// Get the `FieldValue` object
let FieldValue = require('firebase-admin').firestore.FieldValue;

exports.addUser = functions.region('asia-east2').https.onRequest(async (req, res) => {

//<---Write data part-->
// var UserId = "New Sample UserId";
// userOneDocumentRef.doc(UserId).set({
//     name: "New Ploy U",
//     pictureUrl: "1",
// })
// .then(function() {
//     console.log("Document successfully written!");
//     return "OK";
// })
// .catch(function(error) {
//     console.error("Error writing document: ", error);
// });
//<--End write data part-->

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