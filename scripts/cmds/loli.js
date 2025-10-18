const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const g = require("fca-aryan-nix"); // GoatWrapper pour noprefix

module.exports = {
  config: {
    name: "loli",
    version: "1.0",
    author: "Aesther x Christus",
    countDown: 5,
    role: 0,
    category: "image",
    usePrefix: false, // Désactive le préfixe
    noPrefix: true,   // Activation noprefix
    shortDescription: "🍥 Image Loli aléatoire",
    longDescription: "Récupère une image Loli aléatoire depuis l'API",
    guide: "{pn} pour recevoir une image Loli aléatoire"
  },

  onStart: async function({ api, event, message }) {
    const apiUrl = "https://archive.lick.eu.org/api/random/loli";

    try {
      const waitMsg = await message.reply("✨ 𝐑𝐞́𝐜𝐮𝐩𝐞𝐫𝐚𝐭𝐢𝐨𝐧 𝐝𝐞 𝐥'𝐢𝐦𝐚𝐠𝐞 𝐋𝐨𝐥𝐢... 🍥");

      // Récupération de l'image en binaire
      const response = await axios.get(apiUrl, { responseType: "arraybuffer" });
      const filePath = path.join(__dirname, "cache", `loli_${Date.now()}.jpg`);
      fs.ensureDirSync(path.dirname(filePath));
      fs.writeFileSync(filePath, response.data);

      const caption = `
╔═════════════════════════
║ 🍥 𝐋𝐎𝐋𝐈 𝐀𝐋𝐄́𝐀𝐓𝐎𝐈𝐑𝐄
╠═════════════════════════
║ Voici une image Loli pour toi ! ✨
╚═════════════════════════
      `.trim();

      api.sendMessage({
        body: caption,
        attachment: fs.createReadStream(filePath)
      }, event.threadID, () => fs.unlinkSync(filePath));

      // Supprime le message temporaire
      await message.unsend(waitMsg.messageID);

    } catch (err) {
      console.error("❌ Erreur Loli :", err);
      message.reply("❌ Une erreur est survenue lors de la récupération de l'image Loli.");
    }
  }
};

// Activation noprefix via GoatWrapper
const wrapper = new g.GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: false });
