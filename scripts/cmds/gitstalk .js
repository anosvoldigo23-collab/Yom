const axios = require("axios");
const g = require("fca-aryan-nix"); // GoatWrapper pour noprefix

module.exports = {
  config: {
    name: "gitstalk",
    version: "1.0",
    author: "Christus x Aesther",
    countDown: 5,
    role: 0,
    usePrefix: false, // Désactive le préfixe
    noPrefix: true,   // Activation noprefix
    shortDescription: { en: "Espionner un profil GitHub" },
    longDescription: { en: "Récupère les détails d'un utilisateur GitHub (publics) en utilisant l'API d'Aryan." },
    category: "social",
    guide: { en: "{pn} <nom-d'utilisateur-github>\n\nExample:\n{pn} ntkhang03" }
  },

  onStart: async function({ api, args, event }) {
    if (!args[0]) return api.sendMessage("❌ Veuillez fournir un nom d'utilisateur GitHub.", event.threadID, event.messageID);

    const username = args[0];
    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    try {
      const url = `https://aryanapi.up.railway.app/api/gitinfo?username=${encodeURIComponent(username)}`;
      const { data } = await axios.get(url);

      if (!data.status || !data.data) return api.sendMessage("❌ Impossible de récupérer les informations du profil GitHub.", event.threadID, event.messageID);

      const u = data.data;
      const caption = `
🐙 Espionnage de profil GitHub

👤 Nom: ${u.name || "N/A"}
🔗 Nom d'utilisateur: ${u.login}
📝 Bio: ${u.bio || "Pas de bio"}

📂 Repos publics: ${u.public_repos}
📑 Gists publics: ${u.public_gists}
👥 Abonnés: ${u.followers}
➡️ Suivi: ${u.following}

📅 Rejoint le: ${new Date(u.created_at).toLocaleDateString()}
♻️ Dernière mise à jour: ${new Date(u.updated_at).toLocaleDateString()}

🌍 Blog: ${u.blog || "N/A"}
🐦 Twitter: ${u.twitter_username || "N/A"}
🏢 Entreprise: ${u.company || "N/A"}
📍 Lieu: ${u.location || "N/A"}

🔗 Profil: ${u.html_url}

👀 Demandé par: @${event.senderID}
`;

      api.sendMessage({
        body: caption,
        attachment: await getStreamFromURL(u.avatar_url)
      }, event.threadID, event.messageID);

      api.setMessageReaction("✅", event.messageID, () => {}, true);

    } catch (err) {
      console.error("❌ Erreur Gitstalk:", err.message);
      api.sendMessage("❌ Échec de la récupération des informations du profil GitHub.", event.threadID, event.messageID);
      api.setMessageReaction("❌", event.messageID, () => {}, true);
    }
  }
};

async function getStreamFromURL(url) {
  const res = await axios({ url, responseType: "stream" });
  return res.data;
}

// Activation noprefix via GoatWrapper
const wrapper = new g.GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: false });
