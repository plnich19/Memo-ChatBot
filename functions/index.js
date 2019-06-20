const admin = require('firebase-admin');
const serviceAccount = require("./serviceAccountKey.json");
const functions = require('firebase-functions');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://memo-chatbot.firebaseio.com"
  });

let db = admin.firestore();
var userOneDocumentRef = db.collection('users');

exports.addUser = functions.region('asia-east2').https.onRequest(async (req, res) => {
var UserId = "New Sample UserId";
userOneDocumentRef.doc(UserId).set({
    name: "New Ploy U",
    pictureUrl: "1",
})
.then(function() {
    console.log("Document successfully written!");
    return "OK";
})
.catch(function(error) {
    console.error("Error writing document: ", error);
});

});