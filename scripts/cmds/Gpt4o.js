const axios = require('axios');
const g = require('fca-aryan-nix'); // Import GoatWrapper

module.exports = {
  config: {
    name: "gpt4o",
    aliases: ["askgpt4o", "kohi"],
    version: "1.1",
    author: "Christus",
    countDown: 5,
    role: 0,
    shortDescription: "Pose une question à GPT-4o (API Kohi)",
    longDescription: "Utilise l'API https://api-library-kohi.onrender.com/api/gpt4o pour envoyer une question et obtenir une réponse IA.",
    category: "𝗔𝗜",
    guide: "{pn} <question> — ou reply à un message",
    noPrefix: true // Noprefix activé
  },

  onStart: async function ({ message, args, event, api }) {
    try {
      let prompt = args.join(' ').trim();

      // Si le message est une réponse, on prend son texte
      if (!prompt && event.messageReply && event.messageReply.body) {
        prompt = event.messageReply.body;
      }

      if (!prompt) return; // Rien à faire si aucun texte

      // Message de traitement
      const waiting = await api.sendMessage('🤖 GPT-4o est en train de réfléchir...', event.threadID);

      const url = `https://api-library-kohi.onrender.com/api/gpt4o?prompt=${encodeURIComponent(prompt)}`;
      const res = await axios.get(url, { timeout: 60000 });

      await api.unsendMessage(waiting.messageID);

      if (!res.data || !res.data.status) {
        return api.sendMessage('❌ Aucune réponse reçue de GPT-4o.', event.threadID, event.messageID);
      }

      const answer = res.data.data || '⚠️ Réponse vide';

      // Réponse encadrée
      const framedAnswer = `╔═════════════════╗\n🧠 𝐑𝐞𝐩𝐨𝐧𝐬𝐞 𝐆𝐏𝐓‑4𝐨 🧠\n╠═════════════════╣\n${answer}\n╚═════════════════╝`;

      return api.sendMessage(framedAnswer, event.threadID, event.messageID);

    } catch (err) {
      console.error(err);
      const errorMsg = (err.response && err.response.data) ? JSON.stringify(err.response.data) : err.message;
      return api.sendMessage(`❌ Erreur lors de la requête GPT-4o :\n${errorMsg}`, event.threadID, event.messageID);
    }
  }
};

// Active noprefix via GoatWrapper
const w = new g.GoatWrapper(module.exports);
w.applyNoPrefix({ allowPrefix: false }); // totalement noprefix
