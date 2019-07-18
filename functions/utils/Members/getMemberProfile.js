module.exports = function getMemberProfile(db, client) {
  const getUsersData = require("./getUsersData");
  const replyToRoom = require("../reply/replyToRoom")(client);
  const replyCorouselToRoom = require("../reply/replyCorouselToRoom")(client);

  return async function(groupId, name, bool) {
    var writeTask = true;
    const isEmpty = function(obj) {
      for (var key in obj) {
        if (obj.hasOwnProperty(key)) return false;
      }
      return true;
    };
    // var userSaidArray = userSaid.split("@");
    // console.log("(getMemberProfile) userSaidArray = ",userSaidArray);
    // <-- Read data from database part -->
    let FindmembersDocumentRef = db
      .collection("data")
      .doc(groupId)
      .collection("members")
      .where("displayName", "==", name.trim());
    let getMemberProfile = await getUsersData(FindmembersDocumentRef);
    console.log("getMemberProfile = ", getMemberProfile);

    if (isEmpty(getMemberProfile)) {
      writeTask = false;
      const replyMsg = `ขออภัยคุณ${name}ยังไม่ได้เปิดการใช้งานบอท คุณ${name}โปรดยืนยันตัวตนก่อนนะครับ
          เมื่อคุณ${name}ยืนยันตัวตนแล้ว ให้พิมพ์คำสั่ง #create task ใหม่อีกครั้งครับ`;
      replyToRoom(groupId, replyMsg);
      // replyConfirmButton(groupId);
    } else {
      if (bool) {
        replyCorouselToRoom(groupId, getMemberProfile);
      } else {
        writeTask = true;
      }
    }
    //<-- End read data part -->
    return writeTask;
  };
};
