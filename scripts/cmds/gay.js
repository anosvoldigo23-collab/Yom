const axios = require("axios");
const fs = require("fs");
const path = require("path");
const g = require("fca-aryan-nix"); // GoatWrapper pour noprefix

module.exports = {
  config: {
    name: "gay",
    aliases: [],
    version: "1.6",
    author: "Christus x Aesther",
    countDown: 2,
    role: 0,
    description: "Génère une image gay avec les IDs de deux utilisateurs.",
    category: "fun",
    guide: {
      en: "{pn} @mention @mention\nOu {pn} @mention\nOu répondre à un message."
    },
    noPrefix: true
  },

  onStart: async function ({ api, event }) {
    try {
      const mentions = Object.keys(event.mentions || {});
      let uid1, uid2, uid1Name, uid2Name;

      if (mentions.length >= 2) {
        uid1 = mentions[0];
        uid2 = mentions[1];
        uid1Name = event.mentions[uid1];
        uid2Name = event.mentions[uid2];
      } else if (mentions.length === 1) {
        uid1 = event.senderID;
        uid2 = mentions[0];
        const userInfo = await api.getUserInfo(uid1);
        uid1Name = userInfo[uid1]?.name || "User";
        uid2Name = event.mentions[uid2];
      } else if (event.messageReply) {
        uid1 = event.senderID;
        uid2 = event.messageReply.senderID;
        const userInfo = await api.getUserInfo([uid1, uid2]);
        uid1Name = userInfo[uid1]?.name || "User";
        uid2Name = userInfo[uid2]?.name || "User";
      } else {
        return api.sendMessage(
          "Veuillez répondre à un message ou mentionner un ou deux utilisateurs.",
          event.threadID,
          event.messageID
        );
      }

      const url = `https://neokex-apis.onrender.com/gay?uid1=${uid1}&uid2=${uid2}`;
      const response = await axios.get(url, { responseType: 'arraybuffer' });
      const filePath = path.join(__dirname, "cache", `gay_${uid1}_${uid2}.jpg`);
      fs.writeFileSync(filePath, Buffer.from(response.data, "binary"));

      const messageBody = `Oh oui ${uid1Name} 💋 ${uid2Name}`;
      const messageMentions = [
        { tag: uid1Name, id: uid1 },
        { tag: uid2Name, id: uid2 }
      ];

      api.sendMessage({
        body: messageBody,
        attachment: fs.createReadStream(filePath),
        mentions: messageMentions
      }, event.threadID, () => fs.unlinkSync(filePath), event.messageID);

    } catch (e) {
      console.error("Erreur:", e.message);
      api.sendMessage(
        "❌ Impossible de générer l'image. Veuillez réessayer plus tard.",
        event.threadID,
        event.messageID
      );
    }
  }
};

// Activation noprefix via GoatWrapper
const wrapper = new g.GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: false });
