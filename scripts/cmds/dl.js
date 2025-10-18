const axios = require("axios");
const g = require("fca-aryan-nix"); // GoatWrapper pour noprefix

module.exports = {
  config: {
    name: "dl",
    aliases: [],
    version: "1.4",
    author: "Christus",
    role: 0,
    category: "𝗠𝗘𝗗𝗜𝗔",
    shortDescription: { fr: "📥 Télécharger et envoyer une vidéo depuis une URL" },
    longDescription: { fr: "Télécharge une vidéo depuis une URL et l'envoie automatiquement dans le chat." },
    guide: { fr: "Utilisez la commande : dl <url> ou répondez à un message contenant un lien." },
    noPrefix: true // Activation noprefix
  },

  onStart: async function ({ api, event, args }) {
    let videoURL = args.join(" ");

    // Vérifier si l'URL est dans le message répondu
    if (!videoURL && event.messageReply?.body) {
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const foundURLs = event.messageReply.body.match(urlRegex);
      videoURL = foundURLs?.[0];
    }

    if (!videoURL) {
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      return api.sendMessage(
        "⚠️ Veuillez fournir une URL ou répondre à un message contenant un lien.",
        event.threadID,
        event.messageID
      );
    }

    try {
      const apiData = await axios.get(
        "https://raw.githubusercontent.com/romeoislamrasel/romeobot/refs/heads/main/api.json"
      );
      const apiUrl = apiData.data.alldl;

      api.setMessageReaction("⏳", event.messageID, () => {}, true);

      const response = await axios.get(`${apiUrl}/allLink`, { params: { link: videoURL } });

      if (response.status === 200 && response.data.download_url) {
        const { download_url: high, platform, video_title } = response.data;
        const stream = await global.utils.getStreamFromURL(high, "video.mp4");

        api.setMessageReaction("✅", event.messageID, () => {}, true);

        await api.sendMessage(
          {
            body: `💁‍♂️ Votre vidéo a été téléchargée !\n\n🌐 Plateforme : ${platform}\n🎬 Titre : ${video_title}`,
            attachment: stream
          },
          event.threadID,
          event.messageID
        );
      } else {
        api.setMessageReaction("❌", event.messageID, () => {}, true);
        api.sendMessage(
          "🚫 Impossible de récupérer l'URL de téléchargement. Réessayez plus tard.",
          event.threadID,
          event.messageID
        );
      }
    } catch (error) {
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      api.sendMessage(
        "⚠️ Une erreur est survenue lors de la récupération de la vidéo.",
        event.threadID,
        event.messageID
      );
    }
  },

  onChat: async function ({ api, event }) {
    // Initialisation de l'état auto-download
    if (!global.autoDownloadStates) global.autoDownloadStates = {};
    const threadID = event.threadID;
    if (global.autoDownloadStates[threadID] === undefined) global.autoDownloadStates[threadID] = "on";

    // Commandes manuelles d'activation/désactivation
    const cmd = event.body?.toLowerCase();
    if (cmd === "!dl on") return api.sendMessage("✅ Téléchargement automatique ACTIVÉ pour ce fil.", threadID, event.messageID) && (global.autoDownloadStates[threadID] = "on");
    if (cmd === "!dl off") return api.sendMessage("❌ Téléchargement automatique DÉSACTIVÉ pour ce fil.", threadID, event.messageID) && (global.autoDownloadStates[threadID] = "off");
    if (global.autoDownloadStates[threadID] === "off") return;

    // Détection automatique d'URLs dans les messages
    const urlRegex = /https:\/\/(vt\.tiktok\.com|www\.tiktok\.com|www\.facebook\.com|www\.instagram\.com|youtu\.be|youtube\.com|x\.com|pin\.it|twitter\.com|vm\.tiktok\.com|fb\.watch)[^\s]+/g;
    let videoURL = event.body?.match(urlRegex)?.[0] || event.messageReply?.body?.match(urlRegex)?.[0];
    if (!videoURL) return;

    try {
      const apiData = await axios.get(
        "https://raw.githubusercontent.com/romeoislamrasel/romeobot/refs/heads/main/api.json"
      );
      const apiUrl = apiData.data.alldl;

      api.setMessageReaction("⏳", event.messageID, () => {}, true);

      const response = await axios.get(`${apiUrl}/allLink`, { params: { link: videoURL } });

      if (response.status === 200 && response.data.download_url) {
        const { download_url: high, platform, video_title } = response.data;
        const stream = await global.utils.getStreamFromURL(high, "video.mp4");

        api.setMessageReaction("✅", event.messageID, () => {}, true);

        await api.sendMessage(
          {
            body: `💁‍♂️ Vidéo téléchargée automatiquement !\n\n🌐 Plateforme : ${platform}\n🎬 Titre : ${video_title}`,
            attachment: stream
          },
          threadID,
          event.messageID
        );
      } else api.setMessageReaction("🚫", event.messageID, () => {}, true);
    } catch {
      api.setMessageReaction("🚫", event.messageID, () => {}, true);
    }
  }
};

// Activation noprefix via GoatWrapper
const w = new g.GoatWrapper(module.exports);
w.applyNoPrefix({ allowPrefix: false });
