module.exports = function(dependencies) {
  return function(req, res) {
    const {
      groupId,
      replyToRoom,
      replyToken,
      replyConfirmButton,
      WriteGroupData
    } = dependencies;
    const welComeMsg = `สวัสดีครับ น้องโน๊ตขอขอบคุณที่ท่านแอดน้องโน๊ตเข้ากลุ่ม
คำแนะนำการใช้งานน้องโน๊ต
- แอดน้องโน๊ตเป็นเพื่อน
- กดยืนยันการใช้งานในมือถือ
คำสั่ง 
- #Create [ชื่อ task] #to @name เพื่อสร้าง task ใหม่และมอบหมายงานให้คนๆ นั้น
- #Create [ชื่อ task] ในกรณีที่ไม่มีผู้รับงานเฉพาะเจาะจง 
- #display เพื่อให้บอทแสดง task list ของวันนี้ นายท่านสามารถแก้สถานะแล้วก็ข้อมูลของ task ได้ตรงนี้นะครับ`;
    WriteGroupData(groupId);
    replyToRoom(groupId, welComeMsg);
    replyConfirmButton(replyToken);
  };
};
