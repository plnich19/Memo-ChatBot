const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");
const functions = require("firebase-functions");
const line = require("@line/bot-sdk");
const request = require("request-promise");

const config = require("./modules/config");
const getLINE_config = config.getLINE_config;
const getLINE_HEADER = config.getLINE_HEADER;

const client = new line.Client(getLINE_config);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: config.databaseURL
});

const db = admin.firestore();
const dataOneDocumentRef = db.collection("data");

const reply = require("./utils/reply/reply")(client);
const replyToRoom = require("./utils/reply/replyToRoom")(client);
const replyCorouselToRoom = require("./utils/reply/replyCorouselToRoom")(
  client
);
const replyConfirmButton = require("./utils/reply/replyConfirmButton")(client);
const replyLiff = require("./utils/reply/replyLiff")(client);

const getTasks = require("./utils/Tasks/getTasks")(db);
const getYourTask = require("./utils/Tasks/getYourTask")(db);
const getTaskDetailNotDone = require("./utils/Tasks/getTaskDetailNotDone")(db);
const getTaskDetailbyDate = require("./utils/Tasks/getTaskDetailbyDate")(db);
const getTaskDetailDueDate = require("./utils/Tasks/getTaskDetailDueDate")(db);
const getGroupIds = require("./utils/getGroupIds");
const getUserProfileById = require("./utils/getUserProfileById")(client);
const getTargetLimitForAdditionalMessages = require("./utils/getLineAPI/getTargetLimitForAdditionalMessages")(
  request
);
const getNumberOfMessagesSentThisMonth = require("./utils/getLineAPI/getNumberOfMessagesSentThisMonth")(
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
const updateTask = require("./utils/Tasks/updateTask")(db);
const updateTime = require("./utils/updateTime")(db, client);
const deleteTask = require("./utils/Tasks/deleteTask")(db);
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
