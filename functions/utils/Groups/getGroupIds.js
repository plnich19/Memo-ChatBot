module.exports = function getGroupIds(db) {
  return db.get().then(snapshot => {
    let GroupsArray = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      console.log("getGroupsData = ", doc.id, "=>", data);

      GroupsArray.push(doc.id);
    });

    return GroupsArray;
  });
};
