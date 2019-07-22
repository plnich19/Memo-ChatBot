module.exports = function replyDatePicker(client) {
  return function(replyToken, groupId, taskId, dateLimit) {
    return client.pushMessage(groupId, {
      type: "template",
      altText: "คลิกเพื่อดูโน๊ต",
      template: {
        type: "buttons",
        title: "จด task เรียบร้อยแล้วครับ",
        text: "เพิ่มวันที่, เปลี่ยนชื่อ, ดู task ได้ตรงนี้เลย!",
        actions: [
          {
            type: "uri",
            label: "ดูโน๊ต",
            uri: `line://app/1568521906-qP1vaA4y/?mytask=1`
          }
        ]
      }
    });
  };
};
