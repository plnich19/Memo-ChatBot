module.exports = function replyDatePicker(client) {
  return function(replyToken, groupId, taskId, dateLimit) {
    return client.pushMessage(groupId, {
      type: "template",
      altText: "This is a buttons template",
      template: {
        type: "buttons",
        title: "เลือกวันที่เวลา",
        text: "เลือกวัน deadline ไหม? ไม่เลือกก็ได้นะ",
        actions: [
          {
            type: "uri",
            label: "เลือกวันเวลา",
            uri: `line://app/1568521906-qP1vaA4y/?mytask=1`
          }
        ]
      }
    });
  };
};
