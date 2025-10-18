const axios = require("axios");
const g = require("fca-aryan-nix"); // GoatWrapper pour noprefix

module.exports = {
  config: {
    name: "instastalk",
    aliases: ["igstalk"],
    version: "1.0",
    author: "Christus x Aesther",
    countDown: 5,
    role: 0,
    category: "social",
    usePrefix: false, // Désactive le préfixe
    noPrefix: true,   // Activation noprefix
    shortDescription: { en: "Espionner un profil Instagram" },
    longDescription: { en: "Récupère les détails d'un profil Instagram (public) en utilisant l'API Aryan." },
    guide: { en: "{pn} <nom_utilisateur>\n\nExemple:\n{pn} arychauhann" }
  },

  onStart: async function ({ api, args, event }) {
    if (!args[0]) return api.sendMessage("❌ Veuillez fournir un nom d'utilisateur Instagram.", event.threadID, event.messageID);

    const username = args[0].replace("@", "");
    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    try {
      const url = `https://aryanapi.up.railway.app/api/instastalk?query=${encodeURIComponent(username)}`;
      const { data } = await axios.get(url);

      if (!data.status || !data.result) {
        return api.sendMessage("❌ Impossible de récupérer les informations du profil.", event.threadID, event.messageID);
      }

      const result = data.result;
      const caption = `
╔═════════════════════════════
║ 📸 𝐈𝐍𝐒𝐓𝐀 𝐒𝐓𝐀𝐋𝐊
╠═════════════════════════════
║ 👤 Nom complet : ${result.fullName || "N/A"}
║ 🔗 Nom d'utilisateur : ${result.username}
║ 📝 Bio : ${result.bio || "Pas de bio"}
║ ✅ Vérifié : ${result.isVerified ? "Oui" : "Non"}
╠═════════════════════════════
║ 👥 Abonnés : ${result.followers}
║ 📂 Publications : ${result.uploads}
║ 📊 Engagement : ${result.engagement}
╠═════════════════════════════
║ 👀 Demandé par : @${event.senderID}
╚═════════════════════════════
      `.trim();

      api.sendMessage({
        body: caption,
        attachment: await getStreamFromURL(result.profileImage)
      }, event.threadID, event.messageID);

      api.setMessageReaction("✅", event.messageID, () => {}, true);

    } catch (err) {
      console.error("❌ Erreur Instastalk:", err.message);
      api.sendMessage("❌ Échec de la récupération des informations du profil Instagram.", event.threadID, event.messageID);
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
