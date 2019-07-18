module.exports = function getMemberProfilebyId(db) {
  return async function(groupId, userId) {
    //<-- Read Document Part-->
    const getDisplayName = function(db) {
      return db
        .get()
        .then(doc => {
          docdata = doc.data();
          return docdata.displayName;
        })
        .catch(err => {
          console.log("Error getting document:", err);
        });
    };
    //<--End Read Document Part-->
    let FindmembersDocumentRef = db
      .collection("data")
      .doc(groupId)
      .collection("members")
      .doc(userId);
    const displayName = await getDisplayName(FindmembersDocumentRef);
    console.log("displayName นอก = ", displayName);
    return displayName;
  };
};
