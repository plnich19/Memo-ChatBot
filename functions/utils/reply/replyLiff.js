module.exports = function replyLiff(client) {
  return function(groupId, message) {
    return client.pushMessage(groupId, {
      type: "flex",
      altText: message,
      contents: {
        type: "bubble",
        hero: {
          type: "image",
          url: "https://sv1.picz.in.th/images/2019/07/18/Ki7y2V.png",
          size: "full",
          aspectRatio: "1:1",
          aspectMode: "cover",
          action: {
            type: "uri",
            label: "Line",
            uri: "line://app/1568521906-qP1vaA4y"
          }
        }
        //  ,
        // body: {
        //   type: "box",
        //   layout: "vertical",
        //   contents: [
        //     {
        //       type: "box",
        //       layout: "vertical",
        //       spacing: "sm",
        //       margin: "lg",
        //       contents: [
        //         {
        //           type: "box",
        //           layout: "baseline",
        //           spacing: "sm",
        //           contents: [
        //             {
        //               type: "text",
        //               text: message,
        //               flex: 5,
        //               size: "sm",
        //               color: "#666666",
        //               wrap: true
        //             }
        //           ]
        //         }
        //       ]
        //     }
        //   ]
        // }
      }
    });
  };
};

// module.exports = function replyLiff(client) {
//   return function(groupId, message) {
//     return client.pushMessage(groupId, {
//       type: "imagemap",
//       baseUrl:
//         "https://firebasestorage.googleapis.com/v0/b/memo-chatbot.appspot.com/o/static%2F300?alt=media&token=53626f40-f1db-4e58-9a5d-275f87c22ebf",
//       altText: "This is an imagemap",
//       baseSize: {
//         width: 300,
//         height: 300
//       },
//       actions: [
//         {
//           type: "uri",
//           label: "Task List",
//           linkUri: "line://app/1568521906-qP1vaA4y",
//           area: {
//             x: 0,
//             y: 0,
//             width: 300,
//             height: 300
//           }
//         }
//       ]
//     });
//   };
// };
