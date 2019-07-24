module.exports = function(dependencies) {
  return async function(req, res) {
    const {
      db,
      getUserProfileById,
      groupId,
      replyToken,
      replyToRoom,
      replyConfirmButton
    } = dependencies;

    const userId = req.body.events[0].joined.members[0].userId;
    const userProfile = await getUserProfileById(userId);
    const welComeMsg = `ยินดีต้อนรับ ${userProfile.displayName}
    คำสั่ง
    - #create [ชื่อ task] #to @name เพื่อสร้าง task ใหม่และมอบหมายงานให้คนๆ นั้น
    - #create [ชื่อ task] ในกรณีที่ไม่มีผู้รับงานเฉพาะเจาะจง 
    - #display เพื่อให้บอทแสดง task list ของวันนี้ นายท่านสามารถแก้สถานะแล้วก็ข้อมูลของ task ได้ตรงนี้นะครับ
    - #help เพื่อดูวิธีการใช้งาน`;
    db.collection("data")
      .doc(groupId)
      .collection("members")
      .doc(userId)
      .set({
        displayName: userProfile.displayName,
        pictureUrl: userProfile.pictureUrl
      })
      .then(res => {
        console.log("Document successfully written!");
        return "Document successfully written!";
      })
      .catch(err => {
        console.error("Error writing document: ", err);
        return "Error writing document";
      });
    replyToRoom(groupId, welComeMsg);
  };
};
