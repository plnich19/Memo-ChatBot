module.exports = function DeleteGroupData(db) {
  return function(groupId) {
    let groupDocumentRef = db.collection("data").doc(groupId);
    return groupDocumentRef.delete();
  };
};
