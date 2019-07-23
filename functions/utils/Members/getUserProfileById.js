module.exports = function getUserProfileById(client) {
<<<<<<< Updated upstream
  return function(userId) {
=======
  return function(replyToken, userId) {
>>>>>>> Stashed changes
    return client.getProfile(userId).catch(err => {
      console.log("getUserProfile err", err);
    });
  };
};
