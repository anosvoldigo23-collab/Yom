const axios = require("axios");
const g = require("fca-aryan-nix"); // GoatWrapper pour noprefix

module.exports = {
  config: {
    name: "cdp",
    aliases: ["coupledp"],
    version: "1.1",
    author: "Christus",
    countDown: 5,
    role: 0,
    category: "image",
    shortDescription: "✨ Envoie un couple DP aléatoire",
    longDescription: "Envoie un couple DP aléatoire depuis l'API",
    guide: "{pn}",
    noPrefix: true // Activation noprefix
  },

  onStart: async function ({ api, event }) {
    try {
      const w = await api.sendMessage("🔄 Génération du couple DP, veuillez patienter...", event.threadID);

      const res = await axios.get("https://xsaim8x-xxx-api.onrender.com/api/cdp2");
      const { boy, girl } = res.data;

      await api.unsendMessage(w.messageID); // Supprime le message temporaire

      api.sendMessage(
        {
          body: "💖════════✨ COUPLE DP ✨════════💖",
          attachment: await Promise.all([
            global.utils.getStreamFromURL(boy),
            global.utils.getStreamFromURL(girl)
          ])
        },
        event.threadID,
        event.messageID
      );
    } catch (e) {
      api.sendMessage("❌ Impossible de récupérer un couple DP.", event.threadID, event.messageID);
      console.error(e);
    }
  }
};

// Activation noprefix via GoatWrapper
const w = new g.GoatWrapper(module.exports);
w.applyNoPrefix({ allowPrefix: false });
