const axios = require("axios");
const fs = require("fs");
const path = require("path");
const g = require("fca-aryan-nix"); // GoatWrapper pour noprefix

module.exports = {
  config: {
    name: "winw",
    version: "1.1",
    author: "Christus x Aesther",
    countDown: 5,
    role: 0,
    shortDescription: "🤼 Génère un meme 'Qui Gagnerait' avec deux utilisateurs",
    longDescription: "Utilise deux mentions ou réponses pour créer un meme 'Qui Gagnerait' fun et aléatoire",
    category: "𝗙𝗨𝗡 & 𝗝𝗘𝗨",
    guide: "{pn} @utilisateur1 vs @utilisateur2\nExemple : {pn} @alice vs @bob",
    usePrefix: false,
    noPrefix: true
  },

  onStart: async function ({ api, event, message }) {
    const { mentions, senderID } = event;
    const header = "🤼 𝗤𝘂𝗶 𝗚𝗮𝗴𝗻𝗲𝗿𝗮𝗶𝘁 ? 🤼";

    const mentionIDs = Object.keys(mentions);
    if (mentionIDs.length < 2) {
      return message.reply(`${header}\n❌ Veuillez mentionner deux utilisateurs à comparer.\nExemple :\nwinw @utilisateur1 vs @utilisateur2`);
    }

    const [uid1, uid2] = mentionIDs;

    const avatar1 = `https://graph.facebook.com/${uid1}/picture?width=512&height=512&access_token=350685531728|62f8ce9f74b12f84c123cc23437a4a32`;
    const avatar2 = `https://graph.facebook.com/${uid2}/picture?width=512&height=512&access_token=350685531728|62f8ce9f74b12f84c123cc23437a4a32`;

    try {
      const res = await axios.get(
        `https://api.popcat.xyz/v2/whowouldwin?image1=${encodeURIComponent(avatar1)}&image2=${encodeURIComponent(avatar2)}`,
        { responseType: "arraybuffer" }
      );

      const filePath = path.join(__dirname, "cache", `winw_${uid1}_${uid2}_${Date.now()}.png`);
      fs.writeFileSync(filePath, res.data);

      message.reply({
        body: `${header}\nVoici le duel ultime entre les deux challengers ! 🏆`,
        attachment: fs.createReadStream(filePath)
      }, () => fs.unlinkSync(filePath));

    } catch (err) {
      console.error(err);
      message.reply(`${header}\n❌ Impossible de générer le meme 'Qui Gagnerait'. Réessayez plus tard.`);
    }
  }
};

// ⚡ Activation noprefix via GoatWrapper
const wrapper = new g.GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: false });
