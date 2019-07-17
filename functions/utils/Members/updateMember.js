module.exports = function updateMember(db) {
  return function(groupId, userId) {
    let FindmembersDocumentRef = db
      .collection("data")
      .doc(groupId)
      .collection("members")
      .doc(userId);
    let transaction = db
      .runTransaction(t => {
        return t.get(FindmembersDocumentRef).then(doc => {
          t.update(FindmembersDocumentRef, { role: "Member" });
          return "UPDATE";
        });
      })
      .then(result => {
        console.log("Transaction success!");
        return "Trainsaction success!";
      })
      .catch(err => {
        console.log("Transaction failure:", err);
      });
  };
};
