module.exports = function getUserProfileById(client) {
  return function(userId) {
    return client.getProfile(userId).catch(err => {
      console.log("getUserProfile err", err);
      reply(replyToken, "อย่าลืมแอดน้องโน๊ตเป็นเพื่อนก่อนน้า");
    });
  };
};
