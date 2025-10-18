const g = require("fca-aryan-nix"); // GoatWrapper pour noprefix

module.exports = {
  config: {
    name: "stick",
    version: "1.1",
    author: "Aesther",
    countDown: 3,
    role: 2, // réservé aux admins
    category: "admin",
    shortDescription: "🎭 Obtiens l'ID d’un sticker Facebook",
    longDescription: "Réponds à un sticker pour en obtenir l'identifiant (ID numérique).",
    guide: "{pn} → réponds à un sticker pour obtenir son ID",
    usePrefix: false,
    noPrefix: true
  },

  onStart: async function({ api, event }) {
    const { messageReply, threadID, messageID } = event;

    if (!messageReply || !messageReply.attachments || messageReply.attachments.length === 0) {
      return api.sendMessage("⚠️ Réponds à un sticker pour obtenir son ID.", threadID, messageID);
    }

    const sticker = messageReply.attachments.find(att => att.type === "sticker");

    if (!sticker) {
      return api.sendMessage("❌ Ce n’est pas un sticker. Réponds à un vrai sticker Facebook.", threadID, messageID);
    }

    const stickerID = sticker.stickerID;

    if (!stickerID) {
      return api.sendMessage("❌ Impossible de récupérer l’ID du sticker.", threadID, messageID);
    }

    // ✨ Message stylé avec cadre
    const resultMsg = `
┌─🎭 𝗦𝘁𝗶𝗰𝗸𝗲𝗿 𝗜𝗗 ─────────────┐
│ 💡 ID : ${stickerID}
└─────────────────────────────┘
`.trim();

    return api.sendMessage(resultMsg, threadID, messageID);
  }
};

// Activation noprefix via GoatWrapper
const wrapper = new g.GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: false });
