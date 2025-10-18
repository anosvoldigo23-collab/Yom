const axios = require("axios");
const fs = require("fs");
const path = require("path");
const g = require("fca-aryan-nix"); // GoatWrapper pour activer le mode noprefix

module.exports = {
  config: {
    name: "clown",
    version: "1.1",
    author: "Christus",
    countDown: 5,
    role: 0,
    shortDescription: {
      fr: "🤡 Ajoute un effet visage de clown à une photo de profil"
    },
    longDescription: {
      fr: "Applique un effet visage de clown à votre avatar ou à celui de la personne mentionnée ou répondue."
    },
    category: "🎭 Fun & Jeu",
    guide: {
      fr: "{pn} [@mention ou réponse]\nSi aucune mention ou réponse, utilise votre photo de profil."
    },
    noPrefix: true // ✅ Activation du mode noprefix
  },

  onStart: async function ({ api, event, message }) {
    const { senderID, mentions, type, messageReply } = event;
    let uid;

    // Détermination de l'utilisateur cible
    if (Object.keys(mentions).length > 0) {
      uid = Object.keys(mentions)[0];
    } else if (type === "message_reply") {
      uid = messageReply.senderID;
    } else {
      uid = senderID;
    }

    const avatarURL = `https://graph.facebook.com/${uid}/picture?width=512&height=512&access_token=350685531728|62f8ce9f74b12f84c123cc23437a4a32`;

    try {
      const waitingMsg = await api.sendMessage("🎨 Génération de l'image clown en cours...", event.threadID);

      const res = await axios.get(`https://api.popcat.xyz/v2/clown?image=${encodeURIComponent(avatarURL)}`, {
        responseType: "arraybuffer"
      });

      const filePath = path.join(__dirname, "cache", `clown_${uid}_${Date.now()}.png`);
      fs.writeFileSync(filePath, res.data);

      await api.unsendMessage(waitingMsg.messageID);

      message.reply({
        body: "🤡✨ Voici votre image avec effet *clown* !",
        attachment: fs.createReadStream(filePath)
      }, () => fs.unlinkSync(filePath));
    } catch (err) {
      console.error(err);
      message.reply("❌ Une erreur est survenue lors de la génération de l'image clown.");
    }
  }
};

// ✅ Activation du mode noprefix
const w = new g.GoatWrapper(module.exports);
w.applyNoPrefix({ allowPrefix: false });
