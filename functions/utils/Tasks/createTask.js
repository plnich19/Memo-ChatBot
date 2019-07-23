module.exports = function createTask(db, client) {
  const replyDatePicker = require("../reply/replyDatePicker")(client);
  const replyConfirmButton = require("../reply/replyConfirmButton")(client);
  const getMemberProfile = require("../Members/getMemberProfile")(db, client);
  const getUserProfileById = require("../Members/getUserProfileById")(client);

  return async function(
    replyToken,
    groupId,
    userId,
    userSaid,
    bool,
    dataOneDocumentRef
  ) {
    let assigneeIdArray = [];
    var assigneeName = [];
    var tasktitle = userSaid.split("#to")[0].trim();
    var onlyone;
    if (bool) {
      onlyone = false;
      var AssigneeString = userSaid.split("#to")[1].trim();
      var assigneeArray = AssigneeString.split(" ");
      for (i = 0; i < assigneeArray.length; i++) {
        if (assigneeArray[i].includes("@")) {
          assigneeName.push(assigneeArray[i].split("@")[1]);
        }
      }
      const getAssigneeIdArray = async function(assigneeName) {
        var getAssigneeData = [];
        assigneeName.forEach(async name => {
          getMemberProfile(groupId, name, false);
          let getdb = db
            .collection("data")
            .doc(groupId)
            .collection("members")
            .where("displayName", "==", name.trim())
            .get();
          getAssigneeData.push(getdb);
          console.log("getAssigneeData = ", getAssigneeData);
        });
        const assigneeIdArray = await Promise.all(getAssigneeData)
          .then(snapshots => {
            var assigneeIdArray = [];
            snapshots.forEach(querySnapshot => {
              querySnapshot.docs.map(element => {
                assigneeIdArray.push(element.id);
                return `${element.id} is pushed`;
              });
            });
            return assigneeIdArray;
          })
          .catch(err => {
            console.log("Push failure:", err);
          });
        return assigneeIdArray;
      };
      assigneeIdArray = await getAssigneeIdArray(assigneeName);
    } else {
      onlyone = true;
      const userProfile = await getUserProfileById(replyToken, userId);
      console.log("userProfile = ", userProfile);
      // <---Write data part-->
      dataOneDocumentRef
        .doc(groupId)
        .collection("members")
        .doc(userId)
        .set({
          displayName: userProfile.displayName,
          pictureUrl: userProfile.pictureUrl
        })
        .then(() => {
          console.log("User successfully written!");
          return "Finished writing task";
        })
        .catch(error => {
          console.error("Error writing document: ", error);
        });
    }
    if (assigneeIdArray.length === assigneeName.length) {
      if (onlyone === true) {
        assigneeIdArray.push(userId);
      }
      let tasksDocumentRef = db
        .collection("data")
        .doc(groupId)
        .collection("tasks");
      // <---Write data part-->
      tasksDocumentRef
        .add({
          title: tasktitle,
          status: false,
          assignee: assigneeIdArray,
          datetime: "",
          createtime: Date.now(),
          createby: userId
        })
        .then(async result => {
          var date = new Date(Date.now());
          var dateISOString = date.toISOString();
          console.log(dateISOString);
          var splitText = dateISOString.split("T");
          var dateLimit = `${splitText[0]}T00:00`;
          console.log(dateLimit);
          console.log("Task successfully written!");
          replyDatePicker(replyToken, groupId, result.id, dateLimit);
          return "Reply Date Picker successfully";
        })
        .catch(error => {
          console.error("Error writing document: ", error);
        });
      // <--End write data part-->
    } else {
      replyConfirmButton(replyToken);
    }
  };
};
