const axios = require("axios");
const g = require("fca-aryan-nix"); // Pour activer noprefix

module.exports = {
  config: {
    name: "tanjiro",
    aliases: ["tanjiroai", "tanjirochat"],
    version: "1.0",
    author: "Christus",
    countDown: 5,
    role: 0,
    shortDescription: "Parle avec Tanjiro",
    longDescription: "Pose une question et Tanjiro te répond via l'API de conversation.",
    category: "IA",
    guide: {
      fr: "{pn} <texte>"
    },
    noPrefix: true // Activation noprefix
  },

  onStart: async function ({ api, event, args }) {
    const prompt = args.join(" ");
    if (!prompt)
      return api.sendMessage("❌ Veuillez entrer un texte à envoyer à Tanjiro.", event.threadID, event.messageID);

    try {
      const url = `https://arychauhann.onrender.com/api/tanjiro?prompt=${encodeURIComponent(prompt)}&uid=${event.senderID}`;
      const res = await axios.get(url);

      if (res.data && res.data.result) {
        const reply = res.data.result;

        // ✨ Cadre stylé pour Tanjiro
        const message = `
╔═══════════════
║ 🌸 Tanjiro 
╠═══════════════
║ 💬 Question :
║ ${prompt}
╠═══════════════
║ 📝 Réponse :
║ ${reply}
╚═══════════════
        `;

        api.sendMessage(message, event.threadID, event.messageID);
      } else {
        api.sendMessage("⚠️ Impossible d'obtenir une réponse de Tanjiro.", event.threadID, event.messageID);
      }
    } catch (err) {
      api.sendMessage("❌ Une erreur est survenue lors de la connexion à l'API Tanjiro.", event.threadID, event.messageID);
      console.error(err);
    }
  }
};

// Activation noprefix
const w = new g.GoatWrapper(module.exports);
w.applyNoPrefix({ allowPrefix: false });
