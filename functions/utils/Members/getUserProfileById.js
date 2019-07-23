module.exports = function getUserProfileById(client) {
  return function(replyToken, userId) {
    const reply = require("../reply/reply")(client);

    return client.getProfile(userId).catch(err => {
      console.log("getUserProfile err", err);
      reply(replyToken, "อย่าลืมแอดน้องโน๊ตเป็นเพื่อนก่อนน้า");
    });
  };
};
