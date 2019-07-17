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
            type: "datetimepicker",
            label: "เลือกวันเวลา",
            data: `taskId=${taskId}`,
            mode: "datetime",
            initial: dateLimit,
            min: dateLimit
          },
          {
            type: "postback",
            label: "Cancel",
            data: `cancel=${taskId}`
          }
        ]
      }
    });
  };
};
