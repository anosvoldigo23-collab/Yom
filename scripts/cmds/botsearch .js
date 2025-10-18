const axios = require('axios');
const g = require("fca-aryan-nix"); // GoatWrapper pour noprefix

module.exports.config = {
  name: "botsearch",
  version: "1.0",
  author: "Christus",
  description: "🔍 Rechercher avec Google Custom Search",
  category: "utilitaire",
  guide: {
    fr: "{pn} [requête] - Exemple : {pn} comment créer un bot"
  },
  noPrefix: true // Activation noprefix
};

module.exports.onStart = async function({ api, event, args, message }) {
  try {
    const query = args.join(" ");
    if (!query) return message.reply("Veuillez entrer une requête de recherche");

    // Vos identifiants (à remplacer)
    const API_KEY = "AIzaSyApKVVy6L44Qz21LR2BJWRhf7yP4qmczvg";
    const CX = "b4c33dfdc37784f23"; // ID de votre moteur de recherche

    const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&cx=${CX}&key=${API_KEY}`;

    message.reply("🔍 Recherche en cours...", async (err, info) => {
      try {
        const response = await axios.get(url);
        const results = response.data.items;

        if (!results || results.length === 0) {
          return message.reply("Aucun résultat trouvé pour votre requête");
        }

        let messageText = `📚 Résultats de recherche pour : "${query}"\n\n`;
        results.slice(0, 5).forEach((item, index) => {
          messageText += `${index + 1}. ${item.title}\n${item.link}\n\n`;
        });

        api.sendMessage(messageText, event.threadID);
        api.unsendMessage(info.messageID);

      } catch (error) {
        console.error("Erreur de recherche :", error);
        message.reply("⚠️ Une erreur est survenue lors de la recherche. La limite de l'API peut avoir été atteinte.");
      }
    });

  } catch (error) {
    console.error(error);
    message.reply("❌ Une erreur est survenue lors de la recherche");
  }
};

// Active le mode noprefix via GoatWrapper
const w = new g.GoatWrapper(module.exports);
w.applyNoPrefix({ allowPrefix: false });
