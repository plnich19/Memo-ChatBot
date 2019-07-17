module.exports = function WriteGroupData(db) {
  return function(groupId) {
    db.collection("data")
      .doc(groupId)
      .set({
        groupId: groupId
      })
      .then(res => {
        console.log("Document successfully written!");
        return "Document successfully written!";
      })
      .catch(err => {
        console.error("Error writing document: ", err);
        return "Error writing document";
      });
  };
};
