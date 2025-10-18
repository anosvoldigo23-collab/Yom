const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const g = require('fca-aryan-nix'); // Import GoatWrapper

module.exports = {
  config: {
    name: "cosplay",
    version: "1.1",
    author: "Aesther x Christus",
    countDown: 5,
    role: 0,
    shortDescription: "🎭 Cosplay aléatoire",
    longDescription: "Récupère une image cosplay aléatoire depuis l'API",
    category: "image",
    guide: "{pn} pour recevoir une image cosplay aléatoire",
    noPrefix: true // Noprefix activé
  },

  onStart: async function({ api, event, message }) {
    const apiUrl = "https://archive.lick.eu.org/api/random/cosplay";

    try {
      const processingMsg = await message.reply("✨ Récupération de l'image cosplay...");

      // Récupération de l'image en binaire
      const response = await axios.get(apiUrl, { responseType: "arraybuffer" });
      const filePath = path.join(__dirname, "cache", `cosplay_${Date.now()}.jpg`);
      fs.writeFileSync(filePath, response.data);

      await api.sendMessage({
        body: "🎭 Voici une image cosplay aléatoire !",
        attachment: fs.createReadStream(filePath)
      }, event.threadID);

      // Supprime le fichier et le message de traitement
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      if (processingMsg && processingMsg.messageID) api.unsendMessage(processingMsg.messageID);

    } catch (err) {
      console.error(err);
      message.reply("❌ Une erreur est survenue lors de la récupération de l'image cosplay.");
    }
  }
};

// Active noprefix via GoatWrapper
const w = new g.GoatWrapper(module.exports);
w.applyNoPrefix({ allowPrefix: false }); // totalement noprefix
