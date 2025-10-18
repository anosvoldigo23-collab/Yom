const axios = require("axios");

module.exports = {
  config: {
    name: "zoro",
    aliases: ["zoroai", "zorochat"],
    version: "1.0",
    author: "Christus",
    countDown: 5,
    role: 0,
    shortDescription: "Parle avec Zoro",
    longDescription: "Pose une question et Zoro te répond via l'API de conversation.",
    category: "IA",
    guide: {
      fr: "{pn} <texte>"
    }
  },

  onStart: async function ({ api, event, args }) {
    const prompt = args.join(" ");
    if (!prompt)
      return api.sendMessage("❌ Veuillez entrer un texte à envoyer à Zoro.", event.threadID, event.messageID);

    try {
      const url = `https://arychauhann.onrender.com/api/zoro?prompt=${encodeURIComponent(prompt)}&uid=${event.senderID}`;
      const res = await axios.get(url);

      if (res.data && res.data.result) {
        const reply = res.data.result;

        // ✨ Cadre stylé pour la réponse
        const message = `
╔═══════════════
║ 🗡️ Zoro 
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
        api.sendMessage("⚠️ Impossible d'obtenir une réponse de Zoro.", event.threadID, event.messageID);
      }
    } catch (err) {
      api.sendMessage("❌ Une erreur est survenue lors de la connexion à l'API Zoro.", event.threadID, event.messageID);
      console.error(err);
    }
  }
};
