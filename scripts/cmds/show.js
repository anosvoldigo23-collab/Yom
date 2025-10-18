const fs = require("fs-extra");
const axios = require("axios");
const g = require("fca-aryan-nix"); // GoatWrapper pour noprefix

const cachePath = __dirname + "/cache/show_cache.json";

// Sauvegarde dans le cache
async function saveToCache(key, content) {
  let cache = {};
  if (fs.existsSync(cachePath)) cache = JSON.parse(fs.readFileSync(cachePath, "utf8"));
  cache[key] = content;
  fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2));
}

// Récupère depuis le cache
async function getFromCache(key) {
  if (!fs.existsSync(cachePath)) return null;
  const cache = JSON.parse(fs.readFileSync(cachePath, "utf8"));
  return cache[key] || null;
}

module.exports = {
  config: {
    name: "show",
    version: "0.0.2",
    author: "Christus",
    role: 0,
    category: "UTILITY",
    shortDescription: "🔎 Affiche le contenu d'une URL",
    longDescription: "Répond à un message contenant une URL puis utilise show 2, show 3, etc. pour les parties suivantes.",
    guide: "{pn} → répondre à un message URL pour afficher le contenu par parties",
    usePrefix: false,
    noPrefix: true
  },

  onStart: async function({ api, event, args }) {
    const { threadID, senderID, messageReply } = event;
    const part = parseInt(args[0]) || 1;
    const cacheKey = `${threadID}_${senderID}`;
    const limit = 1900;

    // Première partie
    if (part === 1) {
      if (!messageReply || !messageReply.body) {
        return api.sendMessage("❌ Veuillez répondre à un message contenant une URL pour utiliser 'show'.", threadID);
      }

      const urlMatch = messageReply.body.match(/https?:\/\/[^\s]+/);
      if (!urlMatch) return api.sendMessage("❌ Aucune URL valide trouvée dans le message répondu.", threadID);

      const url = urlMatch[0];
      try {
        const res = await axios.get(url);
        let content = res.data;
        if (typeof content !== "string") content = JSON.stringify(content, null, 2);
        await saveToCache(cacheKey, content);

        const sliced = content.slice(0, limit);
        const msg = `┌─📄 𝐒𝐡𝐨𝐰 ──────────────┐\n${sliced}\n└─────────────────────┘`;
        return api.sendMessage(msg, threadID);

      } catch (err) {
        console.error(err);
        return api.sendMessage("❌ Échec de la récupération du contenu de l'URL.", threadID);
      }

    } else { // Parties suivantes
      const cached = await getFromCache(cacheKey);
      if (!cached) {
        return api.sendMessage("❌ Aucune donnée précédente trouvée. Utilisez d'abord 'show' en répondant à un message URL.", threadID);
      }

      const start = (part - 1) * limit;
      const end = part * limit;
      const slice = cached.slice(start, end);

      if (!slice) return api.sendMessage("❌ Plus de contenu à afficher.", threadID);

      let reply = `┌─📄 𝐒𝐡𝐨𝐰 ──────────────┐\n${slice}\n└─────────────────────┘`;
      if (end < cached.length) reply += `\n➡ Tapez "show ${part + 1}" pour la suite.`;
      return api.sendMessage(reply, threadID);
    }
  },
};

// Activation noprefix via GoatWrapper
const wrapper = new g.GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: false });
