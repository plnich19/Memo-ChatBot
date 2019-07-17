const moment = require("moment");

module.exports = function updateTime(db, client) {
  const getMemberProfilebyId = require("../Members/getMemberProfilebyId")(db);
  const reply = require("../reply/reply")(client);

  return function(replyToken, groupId, taskId, datetime) {
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
        const assigneeArray = async function(assignee) {
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
        console.log("Error updating time", err);
      });
  };
};
