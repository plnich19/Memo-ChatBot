module.exports = function getUserProfileById(client) {
  return function(userId) {
    return client.getProfile(userId).catch(err => {
      console.log("getUserProfile err", err);
    });
  };
};
