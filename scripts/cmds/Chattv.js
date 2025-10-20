const axios = require("axios");

module.exports = {
  config: {
    name: "chattv",
    aliases: ["tvchat", "ctv"],
    version: "2.1",
    author: "Christus",
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

    // Envoie un message de chargement
    const loadingText = "⏳ ChatTV réfléchit à ta question... 💭";
    api.sendMessage(loadingText, event.threadID, async (err, info) => {
      if (err) return;

      try {
        const response = await axios.get(`https://arychauhann.onrender.com/api/chattv?prompt=${encodeURIComponent(prompt)}`);
        const data = response.data;

        // Supprime le message de chargement
        api.unsendMessage(info.messageID);

        if (data.status && data.result && data.result.reply) {
          // Message stylisé final
          const replyMessage = 
`━━━━━━━━━━━━━━━━━━━
📺 𝗖𝗵𝗮𝘁𝗧𝗩 𝗥𝗲́𝗽𝗼𝗻𝗱 💬
━━━━━━━━━━━━━━━━━━━
👤 𝗧𝗼𝗶 : ${prompt}

🤖 𝗟𝘂𝗶 : ${data.result.reply}
━━━━━━━━━━━━━━━━━━━
✨ Powered by Christus x ChatTV`;

          api.sendMessage(replyMessage, event.threadID, event.messageID);
        } else {
          api.sendMessage("⚠️ Aucune réponse reçue de l'API. Réessaie plus tard.", event.threadID, event.messageID);
        }

      } catch (error) {
        console.error(error);
        api.unsendMessage(info.messageID);
        api.sendMessage("❌ Une erreur est survenue lors de la communication avec ChatTV 📡", event.threadID, event.messageID);
      }
    });
  }
};
