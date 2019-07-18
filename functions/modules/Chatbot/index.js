module.exports = function Chatbot({
  db,
  functions,
  dataOneDocumentRef,
  getMembers,
  replyCorouselToRoom,
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
    const groupId = req.body.events[0].source.groupId;
    if (reqType === "message") {
      const msgType = req.body.events[0].message.type;
      if (msgType === "text") {
        let reqMessage = req.body.events[0].message.text || "";
        if (reqMessage !== "") {
          reqMessage = reqMessage.replace("#Create", "#create");
        }
        if (reqMessage.toLowerCase() === "#member") {
          const getUsers = await getMembers(groupId);
          replyCorouselToRoom(groupId, getUsers);
        } else if (reqMessage.includes("#create")) {
          return require("./createCmd")({
            reqMessage,
            createTask,
            replyToken,
            groupId
          })(req, res);
        } else if (reqMessage.toLowerCase() === "#display") {
          replyLiff(groupId, "กดดูลิสต์ข้างล่างได้เลย!");
        }
      }
    } else if (reqType === "join") {
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
      DeleteGroupData(groupId);
    } else if (reqType === "memberJoined") {
      return require("./MemberJoinedCond")({
        getUserProfileById,
        groupId,
        replyToken,
        replyToRoom,
        replyConfirmButton
      })(req, res);
    } else if (reqType === "memberLeft") {
      return require("./memberLeftCond")({
        DeleteUserData,
        groupId
      })(req, res);
    } else if (reqType === "follow") {
      return require("./followCond")({
        replyToken
      })(req, res);
    } else if (reqType === "postback") {
      return require("./postback")({
        db,
        getUserProfileById,
        replyToken,
        groupId,
        dataOneDocumentRef,
        getMemberProfilebyId,
        reply,
        updateTime
      })(req, res);
    }
  });
};
