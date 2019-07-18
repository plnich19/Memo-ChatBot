module.exports = function(dependencies) {
  return async function(req, res) {
    const {
      db,
      getUserProfileById,
      replyToken,
      dataOneDocumentRef,
      getMemberProfilebyId,
      reply,
      updateTime
    } = dependencies;
    const postbackData = req.body.events[0].postback.data;
    if (postbackData === "confirm") {
      const userId = req.body.events[0].source.userId;
      const userProfile = await getUserProfileById(userId);
      const welComeMsg = `คุณ ${userProfile.displayName} เข้าร่วมการใช้งานแล้ว`;
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
          return "Finished writing task";
        })
        .catch(error => {
          console.error("Error writing document: ", error);
        });
      // <--End write data part-->
    } else if (postbackData.includes("Make admin")) {
      const MakeAdminSplitText = postbackData.split(" ");
      setAdmin(groupId, MakeAdminSplitText);
    } else if (postbackData.includes("taskId=")) {
      const splitText = postbackData.split("=");
      const datetime = req.body.events[0].postback.params.datetime;
      updateTime(replyToken, groupId, splitText[1], datetime);
    } else if (postbackData.includes("cancel")) {
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
    }
  };
};
