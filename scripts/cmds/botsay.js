const g = require("fca-aryan-nix"); // GoatWrapper pour noprefix

module.exports.config = {
  name: "botsay",
  version: "1.0",
  author: "Christus",
  role: 0,
  category: "texte",
  guide: {
    fr: "botsay + (Message que vous voulez que le bot répète)"
  },
  noPrefix: true // Activation noprefix
};

module.exports.onStart = async function({ api, args, event }) {
  const say = args.join(" ");
  if (!say) {
    api.sendMessage("Veuillez entrer un message", event.threadID, event.messageID);
  } else {
    api.sendMessage(say, event.threadID, event.messageID);
  }
};

// Active le mode noprefix via GoatWrapper
const w = new g.GoatWrapper(module.exports);
w.applyNoPrefix({ allowPrefix: false });
