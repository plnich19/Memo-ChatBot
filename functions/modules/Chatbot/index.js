module.exports = function Chatbot({
  db,
  functions,
  getMembers,
  replyCorouselToRoom,
  getMemberProfile,
  createTask,
  replyLiff,
  replyConfirmButton,
  DeleteGroupData,
  DeleteUserData,
  reply,
  getUserProfileById,
  getMemberProfilebyId,
  setAdmin,
  updateTime
}) {
  return functions.region("asia-east2").https.onRequest(async (req, res) => {
    const reqType = req.body.events[0].type;
    console.log("reqType = ", reqType);
    const replyToken = req.body.events[0].replyToken;
    console.log("replyToken = ", replyToken);
    if (reqType === "message") {
      const msgType = req.body.events[0].message.type;
      if (msgType === "text") {
        let reqMessage = req.body.events[0].message.text || "";
        if (reqMessage !== "") {
          reqMessage = reqMessage.replace("#Create", "#create");
        }
        if (reqMessage.toLowerCase() === "#member") {
          const groupId = req.body.events[0].source.groupId;
          const getUsers = await getMembers(groupId);
          replyCorouselToRoom(groupId, getUsers);
        } else if (reqMessage.includes("#create")) {
          return require("./createCmd")({
            reqMessage,
            createTask,
            replyToken
          }))(req, res);
        } else if (reqMessage.toLowerCase() === "#display") {
          const groupId = req.body.events[0].source.groupId;
          replyLiff(groupId, "กดดูลิสต์ข้างล่างได้เลย!");
        }
      }
    } else if (reqType === "join") {
      const groupId = req.body.events[0].source.groupId;
      const welComeMsg = `สวัสดีครับ น้องโน๊ตขอขอบคุณที่ท่านแอดน้องโน๊ตเข้ากลุ่ม
           คำแนะนำการใช้งานน้องโน๊ต
          - สมาชิกในกลุ่มทุกท่านต้องแอดน้องโน๊ตเป็นเพื่อนและกดยืนยันการใช้งานด้านล่างด้วยครับ
           คำสั่ง 
          - #Create [ชื่อ task] #to @name เพื่อสร้าง task ใหม่และมอบหมายงานให้คนๆ นั้น
          - #Create [ชื่อ task] ในกรณีที่ไม่มีผู้รับงานเฉพาะเจาะจง 
          - #display เพื่อให้บอทแสดง task list ของวันนี้ นายท่านสามารถแก้สถานะแล้วก็ข้อมูลของ task ได้ตรงนี้นะครับ`;
      replyToRoom(groupId, welComeMsg);
      replyConfirmButton(replyToken);
    } else if (reqType === "leave") {
      const groupId = req.body.events[0].source.groupId;
      DeleteGroupData(groupId);
    } else if (reqType === "memberJoined") {
      const userId = req.body.events[0].joined.members[0].userId;
      const groupId = req.body.events[0].source.groupId;
      const userProfile = await getUserProfileById(userId);
      const welComeMsg = `ยินดีต้อนรับ ${userProfile.displayName}
          คำแนะนำการใช้งานน้องโน๊ต
          - คุณ ${
            userProfile.displayName
          } โปรดกดยืนยันการใช้งานน้องโน๊ตด้านล่างด้วยนะครับ
          คำสั่ง
          - #Create [ชื่อ task] #to @name เพื่อสร้าง task ใหม่และมอบหมายงานให้คนๆ นั้น
          - #Create [ชื่อ task] ในกรณีที่ไม่มีผู้รับงานเฉพาะเจาะจง 
          - #display เพื่อให้บอทแสดง task list ของวันนี้ นายท่านสามารถแก้สถานะแล้วก็ข้อมูลของ task ได้ตรงนี้นะครับ`;
      replyToRoom(groupId, welComeMsg);
      replyConfirmButton(replyToken);
    } else if (reqType === "memberLeft") {
      const userId = req.body.events[0].left.members[0].userId;
      const groupId = req.body.events[0].source.groupId;
      DeleteUserData(groupId, userId);
    } else if (reqType === "follow") {
      const groupId = req.body.events[0].source.userId;
      const welComeMsg = `สวัสดีครับ นี่คือน้องโน๊ตเองครับ 
         คำแนะนำการใช้งาน
        - แอดน้องโน๊ตเข้ากลุ่มเพื่อใช้งานนะครับ
         คำสั่ง 
        - #Create [ชื่อ task] #to @name เพื่อสร้าง task ใหม่และมอบหมายงานให้คนๆ นั้น
        - #Create [ชื่อ task] ในกรณีที่ไม่มีผู้รับงานเฉพาะเจาะจง 
        - #display เพื่อให้บอทแสดง task list ของวันนี้ นายท่านสามารถแก้สถานะแล้วก็ข้อมูลของ task ได้ตรงนี้นะครับ`;
      reply(replyToken, welComeMsg);
    } else if (reqType === "postback") {
      const postbackData = req.body.events[0].postback.data;
      if (postbackData === "confirm") {
        const groupId = req.body.events[0].source.groupId;
        const userId = req.body.events[0].source.userId;
        const userProfile = await getUserProfileById(userId);
        const welComeMsg = `คุณ ${
          userProfile.displayName
        } เข้าร่วมการใช้งานแล้ว`;
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
        const groupId = req.body.events[0].source.groupId;
        const MakeAdminSplitText = postbackData.split(" ");
        setAdmin(groupId, MakeAdminSplitText);
      } else if (postbackData.includes("taskId=")) {
        const groupId = req.body.events[0].source.groupId;
        const splitText = postbackData.split("=");
        const datetime = req.body.events[0].postback.params.datetime;
        updateTime(replyToken, groupId, splitText[1], datetime);
      } else if (postbackData.includes("cancel")) {
        const groupId = req.body.events[0].source.groupId;
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
    }
  });
};
