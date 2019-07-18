// module.exports = function replyLiff(client) {
//   return function(groupId, message) {
//     return client.pushMessage(groupId, {
//       type: "flex",
//       altText: message,
//       contents: {
//         type: "bubble",
//         body: {
//           type: "box",
//           layout: "vertical",
//           contents: [
//             {
//               type: "box",
//               layout: "vertical",
//               spacing: "sm",
//               margin: "lg",
//               contents: [
//                 {
//                   type: "box",
//                   layout: "baseline",
//                   spacing: "sm",
//                   contents: [
//                     {
//                       type: "text",
//                       text: message,
//                       flex: 5,
//                       size: "sm",
//                       color: "#666666",
//                       wrap: true
//                     }
//                   ]
//                 }
//               ]
//             }
//           ]
//         },
//         footer: {
//           type: "box",
//           layout: "vertical",
//           flex: 0,
//           spacing: "sm",
//           contents: [
//             {
//               type: "button",
//               action: {
//                 type: "uri",
//                 label: "Task list",
//                 uri: "line://app/1568521906-qP1vaA4y"
//               },
//               height: "sm",
//               style: "link"
//             },
//             {
//               type: "spacer",
//               size: "sm"
//             }
//           ]
//         }
//       }
//     });
//   };
// };

module.exports = function replyLiff(client) {
  return function(groupId, message) {
    return client.pushMessage(groupId, {
      type: "imagemap",
      baseUrl: "https://uppic.cc/v/KdqW/460",
      altText: "This is an imagemap",
      baseSize: {
        width: 1040,
        height: 1149
      },
      actions: []
    });
  };
};
