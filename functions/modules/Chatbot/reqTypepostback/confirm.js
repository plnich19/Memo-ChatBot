module.exports = function(dependencies) {
  return async function(req, res) {
    const {
      getUserProfileById,
      replyToken,
      groupId,
      dataOneDocumentRef,
      reply
    } = dependencies;
    const userId = req.body.events[0].source.userId;
    const userProfile = await getUserProfileById(userId);
    console.log("userprofile = ", userProfile.displayName);
    const welComeMsg = `คุณ ${userProfile.displayName} เข้าร่วมการใช้งานแล้ว`;
    reply(replyToken, welComeMsg);
    // <---Write data part-->
    dataOneDocumentRef
      .doc(groupId)
      .collection("members")
      .doc(userId)
      .set({
        displayName: userProfile.displayName,
        pictureUrl: userProfile.pictureUrl
      })
      .then(() => {
        console.log("User successfully written!");
        return "Finished writing task";
      })
      .catch(error => {
        console.error("Error writing document: ", error);
      });
    // <--End write data part-->
  };
};
