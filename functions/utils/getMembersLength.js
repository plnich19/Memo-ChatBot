const getMembers = require("./getMembers");

module.exports = async function getMembersLength(GroupsArray) {
  var MembersCount = 0;
  //console.log("type of MembersCount = ", typeof MembersCount);

  const total = GroupsArray.map(async groupId => {
    const getUsers = await getMembers(groupId);
    console.log("getUsers = ", getUsers);
    var size = Number(Object.keys(getUsers).length);
    console.log("size = ", size);
    console.log("type of size = ", typeof size);
    MembersCount = MembersCount + size;
    console.log("MembersCount ใน map = ", MembersCount);
    return MembersCount;
  });
  const total2 = await Promise.all(total);
  console.log("MembersCount นอก map = ", total2);
  return total2;
};
