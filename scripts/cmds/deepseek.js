const axios = require("axios");

module.exports = {
  config: {
    name: "deepseek",
    aliases: ["ds2"],
    version: "1.2",
    author: "Christus",
    countDown: 5,
    role: 0,
    shortDescription: "🤖 Discute avec DeepSeek AI",
    longDescription: "Envoie un prompt à l'API DeepSeek2 et récupère la réponse AI.",
    category: "AI",
    isNoprefix: true
  },

  onStart: async function ({ api, event, args }) {
    try {
      // Prompt personnalisé ou "Hello" par défaut
      const prompt = args.join(" ") || "Hello";
      const model = 1;

      // Obtenir la date exacte en Côte d'Ivoire
      const dateCIV = new Date().toLocaleString("fr-FR", { timeZone: "Africa/Abidjan" });

      const response = await axios.get(
        `https://arychauhann.onrender.com/api/deepseek2?prompt=${encodeURIComponent(prompt)}&model=${model}`
      );

      const data = response.data;

      if (data.status) {
        const message = `
╔═════════════════════
║ 🤖 𝐃𝐞𝐞𝐩𝐒𝐞𝐞𝐤 𝐀𝐈
║ 📅 𝐃𝐚𝐭𝐞 (Côte d'Ivoire) : ${dateCIV}
╠═════════════════════
║ 📝 𝐑𝐞𝐩𝐨𝐧𝐬𝐞 :
${data.result}
╚═════════════════════
        `;

        api.sendMessage(message, event.threadID, event.messageID);
      } else {
        api.sendMessage("⚠️ DeepSeek API a rencontré un problème.", event.threadID, event.messageID);
      }
    } catch (err) {
      api.sendMessage(
        `❌ Erreur lors de la requête à DeepSeek API.\nDétails: ${err.message}`,
        event.threadID,
        event.messageID
      );
    }
  }
};
