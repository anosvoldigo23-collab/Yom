const axios = require("axios");

module.exports = {
  config: {
    name: "chattv",
    aliases: ["tvchat", "ctv"],
    version: "2.0",
    author: "Christus ✨",
    countDown: 3,
    role: 0,
    shortDescription: "Discuter avec ChatTV 📺",
    longDescription: "Envoie une question ou un message à ChatTV et reçois une réponse stylisée 💬",
    category: "AI 🧠"
  },

  onStart: async function ({ api, event, args }) {
    const prompt = args.join(" ");
    if (!prompt) {
      return api.sendMessage(
        "⚠️ | Veuillez entrer un message pour discuter avec ChatTV.\n\n📌 Exemple : !chattv Bonjour 👋",
        event.threadID,
        event.messageID
      );
    }

    // Message de chargement avec animation simulée
    const loadingMsg = await api.sendMessage(
      "⏳ ChatTV réfléchit à ta question... 💭",
      event.threadID
    );

    try {
      const response = await axios.get(`https://arychauhann.onrender.com/api/chattv?prompt=${encodeURIComponent(prompt)}`);
      const data = response.data;

      if (data.status && data.result && data.result.reply) {
        // Message stylisé
        const replyMessage = 
`━━━━━━━━━━━━━━━━━━━
📺 𝗖𝗵𝗮𝘁𝗧𝗩 𝗥𝗲́𝗽𝗼𝗻𝗱 💬
━━━━━━━━━━━━━━━━━━━
👤 𝗧𝗼𝗶 : ${prompt}

🤖 𝗟𝘂𝗶 : ${data.result.reply}
━━━━━━━━━━━━━━━━━━━
✨ Powered by Christus x ChatTV`;

        api.editMessage(replyMessage, loadingMsg.messageID);
      } else {
        api.editMessage("⚠️ Aucune réponse reçue de l'API. Réessaie plus tard.", loadingMsg.messageID);
      }

    } catch (error) {
      console.error(error);
      api.editMessage("❌ Une erreur est survenue lors de la communication avec ChatTV 📡", loadingMsg.messageID);
    }
  }
};
