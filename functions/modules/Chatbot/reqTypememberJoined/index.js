module.exports = function(dependencies) {
  return async function(req, res) {
    const {
      getUserProfileById,
      groupId,
      reply,
      replyToken,
      dataOneDocumentRef
    } = dependencies;

    const userId = req.body.events[0].joined.members[0].userId;
    const userProfile = await getUserProfileById(userId);
    const welComeMsg = `ยินดีต้อนรับ ${userProfile.displayName}
    คำแนะนำการใช้งานน้องโน๊ต
    คำสั่ง
    - #Create [ชื่อ task] #to @name เพื่อสร้าง task ใหม่และมอบหมายงานให้คนๆ นั้น
    - #Create [ชื่อ task] ในกรณีที่ไม่มีผู้รับงานเฉพาะเจาะจง 
    - #display เพื่อให้บอทแสดง task list ของวันนี้ นายท่านสามารถแก้สถานะแล้วก็ข้อมูลของ task ได้ตรงนี้นะครับ`;
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
    reply(replyToken, welComeMsg);
  };
};
