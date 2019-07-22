module.exports = function getUsersData(db) {
  return db.get().then(snapshot => {
    let UsersArray = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      console.log("getUsersData = ", doc.id, "=>", data);

      UsersArray.push({
        userId: doc.id,
        displayName: data.displayName,
        pictureUrl: data.pictureUrl
      });
    });
    return UsersArray;
  });
};
