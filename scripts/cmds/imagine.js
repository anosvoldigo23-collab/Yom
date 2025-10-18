const axios = require('axios');
const g = require("fca-aryan-nix"); // GoatWrapper pour noprefix

module.exports = {
  config: {
    name: "imagine",
    aliases: ["ima"],
    version: "0.0.1",
    author: "Christus x Aesther",
    countDown: 5,
    role: 0,
    category: "ai",
    usePrefix: false, // Désactive le préfixe
    noPrefix: true,   // Activation noprefix
    shortDescription: { en: "Generate image using AI" },
    longDescription: { en: "Send a prompt to the AI image generation API and get back an image." },
    guide: { en: "{pn} [prompt text]" }
  },

  onStart: async function ({ api, event, args }) {
    const prompt = args.join(" ");
    if (!prompt) {
      return api.sendMessage(
        "❌ Veuillez fournir une invite.\nExemple: imaginez un magnifique coucher de soleil sur les montagnes",
        event.threadID,
        event.messageID
      );
    }

    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    const apiUrl = `http://65.109.80.126:20409/aryan/imagine?prompt=${encodeURIComponent(prompt)}`;

    try {
      const response = await axios.get(apiUrl, { responseType: 'stream' });

      const msg = `
╔═══════════════════════════
║ ✨ 𝐈𝐌𝐀𝐆𝐄 𝐆𝐄́𝐍𝐄́𝐑𝐄́𝐄 ✨
╠═══════════════════════════
║ 📝 Invite : ${prompt}
║ 📤 Génération terminée !
╚═══════════════════════════
      `.trim();

      await api.sendMessage({
        body: msg,
        attachment: response.data
      }, event.threadID, null, event.messageID);

      api.setMessageReaction("✅", event.messageID, () => {}, true);

    } catch (error) {
      console.error("AI Image API Error:", error.message || error);
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      api.sendMessage("⚠ La génération d'image a échoué depuis l'API AI.", event.threadID, event.messageID);
    }
  }
};

// Activation noprefix via GoatWrapper
const wrapper = new g.GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: false });
