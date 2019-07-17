module.exports = function DeleteUserData(db) {
  return function(groupId, userId) {
    let membersDocumentRef = db
      .collection("data")
      .doc(groupId)
      .collection("members")
      .doc(userId);
    return membersDocumentRef.delete();
  };
};
