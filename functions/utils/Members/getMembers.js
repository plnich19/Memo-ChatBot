const getUsersData = require("./getUsersData");

module.exports = function getMembers(db) {
  return async function(groupId) {
    // <-- Read data from database part -->
    let membersDocumentRef = db
      .collection("data")
      .doc(groupId)
      .collection("members");
    let getUsers = await getUsersData(membersDocumentRef);
    console.log("(getMembers) getUsers = ", getUsers);
    return getUsers;
    //<-- End read data part -->
  };
};
