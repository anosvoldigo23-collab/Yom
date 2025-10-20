const axios = require("axios");

module.exports = {
  config: {
    name: "gptvoc",
    aliases: ["gvoc", "voc"],
    version: "2.0",
    author: "Christus",
    role: 0,
    shortDescription: "🤖 Discute avec GPTVoc AI",
    longDescription: "Pose un prompt à GPTVoc et reçois une réponse stylée avec cadre et emojis.",
    category: "AI",
    isNoprefix: true
  },

  onStart: async function({ api, event, args }) {
    const prompt = args.join(" ") || "Hello";

    try {
      const res = await axios.get(`https://arychauhann.onrender.com/api/gptvoc?prompt=${encodeURIComponent(prompt)}`);
      const data = res.data;

      if (!data.result) {
        return api.sendMessage("⚠️ GPTVoc n'a pas pu générer de réponse.", event.threadID, event.messageID);
      }

      // Date exacte Côte d'Ivoire
      const dateCIV = new Date().toLocaleString("fr-FR", { timeZone: "Africa/Abidjan" });

      // Message stylé avec cadre et emojis
      const message = `
✨🌐───────────────────────────🌐✨
        🤖 𝗚𝗣𝗧𝗩𝗢𝗖 𝐀𝐈
📅 𝐃𝐚𝐭𝐞  : ${dateCIV}
───────────────────────────────
💬 𝐑𝐞𝐩𝐨𝐧𝐬𝐞 :
${data.result}
───────────────────────────────
✨🌐───────────────────────────🌐✨
      `;

      api.sendMessage(message, event.threadID, event.messageID);

    } catch (err) {
      api.sendMessage(`❌ Erreur GPTVoc API : ${err.message}`, event.threadID, event.messageID);
    }
  }
};
