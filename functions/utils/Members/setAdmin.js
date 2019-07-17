module.exports = function setAdmin(db) {
  return async function(groupId, MakeAdminSplitText) {
    let FindmembersDocumentRef = db
      .collection("data")
      .doc(groupId)
      .collection("members")
      .doc(MakeAdminSplitText[2]);
    FindmembersDocumentRef.update({ role: "Admin" })
      .then(result => {
        console.log("Transaction success!");
        return "Role updated";
      })
      .catch(err => {
        console.log("Transaction failure:", err);
      });
  };
};
