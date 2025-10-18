const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const g = require("fca-aryan-nix"); // GoatWrapper pour noprefix

module.exports = {
  config: {
    name: "alert",
    version: "1.0",
    author: "Christus",
    countDown: 5,
    role: 0,
    shortDescription: "Créer une image de style alerte avec du texte personnalisé",
    longDescription: "Génère une image meme de style alerte avec votre texte",
    category: "FUN & JEU",
    guide: "{pn} <texte>",
    noPrefix: true // Activation noprefix
  },

  onStart: async function ({ api, event, args }) {
    if (!args.length) return;

    const text = encodeURIComponent(args.join(" "));

    try {
      const res = await axios.get(`https://api.popcat.xyz/v2/alert?text=${text}`, { responseType: "arraybuffer" });
      const filePath = path.join(__dirname, "cache", `alert_${Date.now()}.png`);
      await fs.outputFile(filePath, res.data);

      await api.sendMessage({
        body: "🚨 Voici votre image d'alerte !",
        attachment: fs.createReadStream(filePath)
      }, event.threadID, event.messageID);

      fs.unlinkSync(filePath);
    } catch (err) {
      console.error(err);
      await api.sendMessage(`❌ Erreur : ${err.message}`, event.threadID, event.messageID);
    }
  }
};

// Active le mode noprefix via GoatWrapper
const w = new g.GoatWrapper(module.exports);
w.applyNoPrefix({ allowPrefix: false });
