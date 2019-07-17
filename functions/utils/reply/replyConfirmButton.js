module.exports = function replyConfirmButton(client) {
  return function(replyToken) {
    return client.replyMessage(replyToken, {
      type: "template",
      altText: "this is a buttons template",
      template: {
        type: "buttons",
        actions: [
          {
            type: "postback",
            label: "ยืนยัน",
            data: "confirm"
          }
        ],
        title: "ยืนยันการใช้งาน",
        text: "คลิกยืนยันเพื่อยืนยันตัวตนนะครับ"
      }
    });
  };
};
