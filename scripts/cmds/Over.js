const axios = require("axios");

module.exports = {
  config: {
    name: "overchat",
    aliases: ["oc", "over"],
    version: "1.0",
    author: "Christus",
    countDown: 5,
    role: 0,
    shortDescription: "Discute avec Overchat 🤖",
    longDescription: "Utilise l'API Overchat pour discuter avec une IA au style cosmique ✨",
    category: "chat",
    guide: {
      vi: "{pn} <message>",
      en: "{pn} <message>"
    }
  },

  onStart: async function({ event, args, message }) {
    const prompt = args.join(" ");
    if (!prompt) {
      return message.reply("❌ Veuillez entrer un message à envoyer à Overchat.");
    }

    try {
      const url = `https://arychauhann.onrender.com/api/overchat?prompt=${encodeURIComponent(prompt)}`;
      const res = await axios.get(url);

      if (res.data && res.data.status && res.data.result) {
        const replyText = res.data.result.result || "⚠️ Aucune réponse générée par Overchat.";
        return message.reply(replyText);
      } else {
        return message.reply("❌ Impossible d'obtenir une réponse d'Overchat.");
      }
    } catch (err) {
      console.error(err);
      return message.reply("⚠️ Une erreur est survenue lors de la communication avec Overchat.");
    }
  }
};
