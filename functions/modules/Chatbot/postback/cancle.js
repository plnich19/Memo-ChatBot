module.exports = function(dependencies) {
  return async function(req, res) {
    const {
      db,
      replyToken,
      groupId,
      postbackData,
      getMemberProfilebyId,
      reply
    } = dependencies;
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
        const replyMsg = `Title : ${docdata.title} 
Due Date : No Duedate 
Assignee : ${assigneeArrayRes[0].join()}

ถูกสร้างขึ้นเรียบร้อยแล้ว! 
พิมพ์ #display เพื่อดูลิสต์เต็มๆ ได้เลยครับ`;
        reply(replyToken, replyMsg);
        return "reply successfully";
      })
      .catch(err => {
        console.log("Error cancel request", err);
      });
  };
};
