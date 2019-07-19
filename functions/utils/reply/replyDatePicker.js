module.exports = function replyDatePicker(client) {
  return function(replyToken, groupId, taskId, dateLimit) {
    return client.pushMessage(groupId, {
      type: "template",
      altText: "This is a buttons template",
      template: {
        type: "buttons",
        title: "จัดการ task",
        text: "เพิ่มวันที่, เปลี่ยนชื่อ, ดู task ได้ตรงนี้เลย!",
        actions: [
          {
            type: "uri",
            label: "จิ้ม",
            uri: `line://app/1568521906-qP1vaA4y/?mytask=1`
          }
        ]
      }
    });
  };
};
