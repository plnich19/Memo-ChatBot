module.exports = function(dependencies) {
  return function(req, res) {
    const { replyToken, reply } = dependencies;
    const welComeMsg = `สวัสดีครับ นี่คือน้องโน๊ตเองครับ 
คำแนะนำการใช้งาน
- แอดน้องโน๊ตเข้ากลุ่มเพื่อใช้งานนะครับ
คำสั่ง 
- #create [ชื่อ task] #to @name เพื่อสร้าง task ใหม่และมอบหมายงานให้คนๆ นั้น
- #create [ชื่อ task] ในกรณีที่ไม่มีผู้รับงานเฉพาะเจาะจง 
- #display เพื่อให้บอทแสดง task list ของวันนี้ นายท่านสามารถแก้สถานะแล้วก็ข้อมูลของ task ได้ตรงนี้นะครับ
- #help เพื่อแสดงวิธีการใช้งาน`;
    reply(replyToken, welComeMsg);
  };
};
