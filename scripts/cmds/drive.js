const axios = require('axios');
const g = require('fca-aryan-nix'); // GoatWrapper pour noprefix

const apiBase = "http://65.109.80.126:20409/aryan/drive";

module.exports = {
  config: {
    name: "drive",
    version: "0.0.3",
    author: "Christus",
    role: 0,
    category: "Utilitaire",
    shortDescription: { fr: "📤 Téléversez facilement des vidéos sur Google Drive" },
    longDescription: { fr: "Permet de téléverser une vidéo depuis un lien ou un média attaché directement sur Google Drive." },
    guide: { fr: "Utilisation : drive <lien> ou répondez à un message contenant un média pour téléverser" },
    noPrefix: true // Activation noprefix
  },

  onStart: async function ({ message, event, args }) {
    // Récupérer l'URL du média ou de l'argument
    const mediaURL = event?.messageReply?.attachments?.[0]?.url || args[0];
    if (!mediaURL) {
      return message.reply("⚠ Veuillez fournir un lien de vidéo ou répondre à un message contenant un média.");
    }

    try {
      const res = await axios.get(`${apiBase}?url=${encodeURIComponent(mediaURL)}`);
      const data = res.data || {};
      console.log("Réponse API Drive :", data);

      const driveLink = data.driveLink || data.driveLIink;
      if (driveLink) {
        return message.reply(`✅ Fichier téléversé avec succès sur Google Drive !\n\n🔗 URL : ${driveLink}`);
      } else {
        const errMsg = data.error || JSON.stringify(data) || "❌ Échec du téléversement du fichier.";
        return message.reply(`⚠ Échec du téléversement : ${errMsg}`);
      }
    } catch (err) {
      console.error("Erreur lors du téléversement :", err.message || err);
      return message.reply("❌ Une erreur est survenue lors du téléversement. Veuillez réessayer plus tard.");
    }
  }
};

// Activation noprefix via GoatWrapper
const wrapper = new g.GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: false });
