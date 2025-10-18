const axios = require("axios");
const g = require("fca-aryan-nix"); // GoatWrapper pour noprefix

module.exports = {
  config: {
    name: "gpt5",
    version: "1.0",
    author: "Christus",
    countDown: 5,
    role: 0,
    usePrefix: false, // Désactive le préfixe
    noPrefix: true,   // Activation noprefix
    shortDescription: { en: "Discuter avec GPT-5" },
    longDescription: { en: "Pose une question et reçois une réponse générée par GPT-5 via l'API externe." },
    category: "IA",
    guide: { en: "{pn} <texte>\n\nExample:\n{pn} Quel temps fait-il à Paris ?" }
  },

  onStart: async function({ api, args, event }) {
    const prompt = args.join(" ");
    if (!prompt) return api.sendMessage("❌ Veuillez entrer un texte à envoyer à GPT-5.", event.threadID, event.messageID);

    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    try {
      const url = `https://arychauhann.onrender.com/api/gpt5?prompt=${encodeURIComponent(prompt)}&uid=${event.senderID}`;
      const res = await axios.get(url);

      if (!res.data || !res.data.result) {
        api.sendMessage("⚠️ Impossible d'obtenir une réponse de l'API GPT-5.", event.threadID, event.messageID);
        return api.setMessageReaction("❌", event.messageID, () => {}, true);
      }

      const reply = res.data.result;

      const message = `
╔═══════════════
║ 🤖 GPT-5 
╠═══════════════
║ 💬 Question :
║ ${prompt}
╠═══════════════
║ 📝 Réponse :
║ ${reply}
╚═══════════════
      `;

      api.sendMessage(message, event.threadID, event.messageID);
      api.setMessageReaction("✅", event.messageID, () => {}, true);

    } catch (err) {
      console.error("❌ Erreur GPT-5:", err.message);
      api.sendMessage("❌ Une erreur est survenue lors de la connexion à l'API GPT-5.", event.threadID, event.messageID);
      api.setMessageReaction("❌", event.messageID, () => {}, true);
    }
  }
};

// Activation noprefix via GoatWrapper
const wrapper = new g.GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: false });
