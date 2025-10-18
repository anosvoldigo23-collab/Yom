const axios = require("axios");
const g = require("fca-aryan-nix"); // GoatWrapper pour noprefix

module.exports = {
  config: {
    name: "imgur",
    version: "1.0.0",
    author: "Christus",
    countDown: 0,
    role: 0,
    category: "utilitaire",
    usePrefix: false, // Désactive le préfixe
    noPrefix: true,   // Activation noprefix
    shortDescription: "Télécharger une image/vidéo sur Imgur",
    longDescription: "Répondre à une image/vidéo ou fournir une URL pour la télécharger sur Imgur.",
    guide: "{pn} répondre à une image/vidéo ou fournir une URL"
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID, messageReply } = event;
    let mediaUrl = "";

    if (messageReply && messageReply.attachments.length > 0) {
      mediaUrl = messageReply.attachments[0].url;
    } else if (args.length > 0) {
      mediaUrl = args.join(" ");
    }

    if (!mediaUrl) {
      return api.sendMessage("❌ Veuillez répondre à une image/vidéo ou fournir une URL !", threadID, messageID);
    }

    try {
      api.setMessageReaction("⏳", messageID, () => {}, true);

      const res = await axios.get(`http://65.109.80.126:20409/aryan/imgur?url=${encodeURIComponent(mediaUrl)}`);
      const imgurLink = res.data.imgur;

      if (!imgurLink) {
        api.setMessageReaction("", messageID, () => {}, true);
        return api.sendMessage("❌ Échec du téléchargement sur Imgur.", threadID, messageID);
      }

      const msg = `
╔═════════════════════════════
║ ✨ 𝐈𝐌𝐆𝐔𝐑 𝐔𝐏𝐋𝐎𝐀𝐃 ✨
╠═════════════════════════════
║ 📤 Lien de l'image/vidéo :
║ ${imgurLink}
╚═════════════════════════════
      `.trim();

      api.setMessageReaction("✅", messageID, () => {}, true);
      return api.sendMessage(msg, threadID, messageID);

    } catch (err) {
      console.error("Erreur de téléchargement Imgur :", err);
      api.setMessageReaction("", messageID, () => {}, true);
      return api.sendMessage("⚠ Une erreur s'est produite lors du téléchargement.", threadID, messageID);
    }
  }
};

// Activation noprefix via GoatWrapper
const wrapper = new g.GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: false });
