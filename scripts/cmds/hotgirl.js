const axios = require("axios");
const fs = require("fs");
const path = require("path");
const g = require("fca-aryan-nix"); // GoatWrapper pour noprefix

module.exports = {
  config: {
    name: "hotgirl",
    version: "1.0",
    author: "Aesther",
    countDown: 5,
    role: 0,
    category: "🔞 NSFW",
    usePrefix: false, // Désactive le préfixe
    noPrefix: true,   // Activation noprefix
    shortDescription: { fr: "🔞 Image sexy directe" },
    longDescription: { fr: "Télécharge une image NSFW directement depuis l’API Delirius" }
  },

  onStart: async function ({ api, event }) {
    const url = "https://delirius-apiofc.vercel.app/nsfw/girls";
    const fileName = `hotgirl_${Date.now()}.jpg`;
    const filePath = path.join(__dirname, "cache", fileName);

    try {
      const response = await axios.get(url, { responseType: "stream" });
      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      writer.on("finish", () => {
        const message = `
╔═════════════════════
║ 🔥 HOTGIRL NSFW 🔥
╠═════════════════════
║ Voici ta dose sexy du jour !
║ Attention, +18 uniquement.
╚═════════════════════
        `.trim();

        api.sendMessage({
          body: message,
          attachment: fs.createReadStream(filePath)
        }, event.threadID, () => fs.unlinkSync(filePath), event.messageID);
      });

      writer.on("error", err => {
        console.error(err);
        api.sendMessage("❌ | Une erreur est survenue lors du téléchargement.", event.threadID, event.messageID);
      });

    } catch (e) {
      console.error(e);
      api.sendMessage("⚠️ | Impossible de récupérer l’image.", event.threadID, event.messageID);
    }
  }
};

// Activation noprefix via GoatWrapper
const wrapper = new g.GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: false });
