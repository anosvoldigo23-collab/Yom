const axios = require('axios');

module.exports = {
  config: {
    name: "ai",
    aliases: ["askgpt4o", "kohi"],
    version: "1.4",
    author: "Christus",
    countDown: 0,
    role: 0,
    shortDescription: "Pose une question à GPT-4o (API Kohi)",
    longDescription: "Répond automatiquement aux messages en utilisant l'API GPT-4o.",
    category: "𝗔𝗜",
    noPrefix: true, // Noprefix activé
    ai: true
  },

  onStart: async function ({ message, args, event, api }) {
    try {
      let prompt = args.join(' ').trim();

      // Si le message est une réponse à un autre message, on prend ce texte comme prompt
      if (!prompt && event.messageReply && event.messageReply.body) {
        prompt = event.messageReply.body;
      }

      if (!prompt) return; // rien à faire si aucun texte

      // Message d'attente
      const waiting = await api.sendMessage('⏳ 𝐺𝑃𝑇‑4𝑜 réfléchit…', event.threadID);

      const url = `https://api-library-kohi.onrender.com/api/gpt4o?prompt=${encodeURIComponent(prompt)}`;
      const res = await axios.get(url, { timeout: 60000 });

      await api.unsendMessage(waiting.messageID);

      if (!res.data || !res.data.status) {
        return api.sendMessage('❌ Aucune réponse reçue de GPT-4o.', event.threadID, event.messageID);
      }

      const answer = res.data.data || '⚠️ Réponse vide';

      // Encadrement stylisé de la réponse
      const framedAnswer = `╔═════════════════╗\n🧠 𝐑𝐞𝐩𝐨𝐧𝐬𝐞 𝐆𝐏𝐓‑4𝐨 🧠\n╠═════════════════╣\n${answer}\n╚═════════════════╝`;

      return api.sendMessage(framedAnswer, event.threadID, event.messageID);

    } catch (err) {
      console.error(err);
      const errorMsg = (err.response && err.response.data) ? JSON.stringify(err.response.data) : err.message;
      return api.sendMessage(`❌ Erreur lors de la requête GPT-4o :\n${errorMsg}`, event.threadID, event.messageID);
    }
  }
};

// Intégration GoatWrapper pour activer le mode noprefix
const g = require('fca-aryan-nix'); // Assure-toi que g est importé correctement
const w = new g.GoatWrapper(module.exports);
w.applyNoPrefix({ allowPrefix: false }); // totalement noprefix, pas de préfixe nécessaire
