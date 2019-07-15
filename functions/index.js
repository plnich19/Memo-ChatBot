const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");
const functions = require("firebase-functions");
const line = require("@line/bot-sdk");
const request = require("request-promise");

// refactor: create config

const config = require("./config/config");
console.log("config = ", config);

const getLINE_config = config.getLINE_config;
// create LINE SDK client
const client = new line.Client(getLINE_config);

// refactor: get this value from config files
const getLINE_HEADER = config.getLINE_HEADER;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: config.databaseURL //rrefactory: move to config value
});

const db = admin.firestore();
const dataOneDocumentRef = db.collection("data");

const reply = require("./utils/reply")(client);
const replyToRoom = require("./utils/replyToRoom")(client);
const replyCorouselToRoom = require("./utils/replyCorouselToRoom")(client);
const replyConfirmButton = require("./utils/replyConfirmButton")(client);
const replyLiff = require("./utils/replyLiff")(client);

const getTasks = require("./utils/getTasks")(db);
const getYourTask = require("./utils/getYourTask")(db);
const getTaskDetailNotDone = require("./utils/getTaskDetailNotDone")(db);
const getTaskDetailbyDate = require("./utils/getTaskDetailbyDate")(db);
const getTaskDetailDueDate = require("./utils/getTaskDetailDueDate")(db);
const getGroupIds = require("./utils/getGroupIds");
const getUserProfileById = require("./utils/getUserProfileById")(client);
const getTargetLimitForAdditionalMessages = require("./utils/getTargetLimitForAdditionalMessages")(
  request
);
const getNumberOfMessagesSentThisMonth = require("./utils/getNumberOfMessagesSentThisMonth")(
  request
);
const getMembers = require("./utils/getMembers")(db);
const getMemberProfile = require("./utils/getMemberProfile")(db, client);
const getMemberProfilebyId = require("./utils/getMemberProfilebyId")(db);
const getMembersLength = require("./utils/getMembersLength")(db);
const DeleteUserData = require("./utils/DeleteUserData")(db);
const DeleteGroupData = require("./utils/DeleteGroupData")(db);
const updateMember = require("./utils/updateMember")(db);
const createTask = require("./utils/createTask")(db, client);
const updateTask = require("./utils/updateTask")(db);
const updateTime = require("./utils/updateTime")(db, client);
const deleteTask = require("./utils/deleteTask")(db);
const setAdmin = require("./utils/setAdmin")(db);

const dependencies = {
  db,
  functions,
  getLINE_HEADER,
  dataOneDocumentRef,
  reply,
  replyToRoom,
  replyCorouselToRoom,
  replyConfirmButton,
  replyLiff,
  getTasks,
  getYourTask,
  getTaskDetailNotDone,
  getTaskDetailbyDate,
  getTaskDetailDueDate,
  getGroupIds,
  getUserProfileById,
  getTargetLimitForAdditionalMessages,
  getNumberOfMessagesSentThisMonth,
  getMembers,
  getMemberProfile,
  getMemberProfilebyId,
  getMembersLength,
  DeleteUserData,
  DeleteGroupData,
  updateMember,
  createTask,
  updateTask,
  updateTime,
  deleteTask,
  setAdmin
};

// usage : https://asia-east2-memo-chatbot.cloudfunctions.net/DataAPI/?action=getMembers&groupId=Ce938b6c2ba40812b0afa36e11078ec56
exports.DataAPI = require("./modules/DataAPI")(dependencies);

// usage : https://asia-east2-memo-chatbot.cloudfunctions.net/CronEndpoint/?action=fruit&message=ไปเอาผลไม้จ้า
exports.CronEndpoint = require("./modules/CronEndpoint")(dependencies);

exports.Chatbot = require("./modules/Chatbot")(dependencies);
