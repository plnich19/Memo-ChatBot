module.exports = function(dependencies) {
  return function(req, res) {
    const {
      groupId,
      replyToRoom,
      replyToken,
      replyConfirmButton
    } = dependencies;
    const welComeMsg = `
  คำแนะนำการใช้งานน้องโน๊ต
  - แอดน้องโน๊ตเป็นเพื่อน
  - กดยืนยันการใช้งานในมือถือ
  คำสั่ง 
  - #Create [ชื่อ task] #to @name เพื่อสร้าง task ใหม่และมอบหมายงานให้คนๆ นั้น
  - #Create [ชื่อ task] ในกรณีที่ไม่มีผู้รับงานเฉพาะเจาะจง 
  - #display เพื่อให้บอทแสดง task list ของวันนี้ นายท่านสามารถแก้สถานะแล้วก็ข้อมูลของ task ได้ตรงนี้นะครับ`;
    replyToRoom(groupId, welComeMsg);
    replyConfirmButton(replyToken);
  };
};
