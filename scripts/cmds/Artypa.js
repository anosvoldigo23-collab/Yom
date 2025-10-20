const axios = require("axios");

module.exports = {
  config: {
    name: "artypa",
    aliases: ["arty"],
    version: "1.1",
    author: "Christus",
    countDown: 5,
    role: 0,
    shortDescription: "🎨 Discute avec ArtyPA AI",
    longDescription: "Envoie un prompt à l'API ArtyPA et récupère la réponse AI.",
    category: "AI",
    isNoprefix: true
  },

  onStart: async function ({ api, event, args }) {
    try {
      const prompt = args.join(" ") || "Hello";

      // Date exacte en Côte d'Ivoire
      const dateCIV = new Date().toLocaleString("fr-FR", { timeZone: "Africa/Abidjan" });

      const response = await axios.get(
        `https://arychauhann.onrender.com/api/artypa?prompt=${encodeURIComponent(prompt)}`
      );

      const data = response.data;

      const message = `
🎨 𝐀𝐫𝐭𝐲𝐏𝐀 𝐀𝐈
📅 Date (Côte d'Ivoire) : ${dateCIV}

📝 Réponse :
${data.result}
      `;

      api.sendMessage(message, event.threadID, event.messageID);

    } catch (err) {
      api.sendMessage(
        `❌ Erreur lors de la requête à ArtyPA API.\nDétails: ${err.message}`,
        event.threadID,
        event.messageID
      );
    }
  }
};
