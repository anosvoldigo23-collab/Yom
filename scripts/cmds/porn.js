const axios = require("axios");
const fs = require("fs");
const g = require("fca-aryan-nix"); // GoatWrapper pour noprefix
const path = require("path");

// Fonction pour convertir du texte en caractères gras mathématiques (𝐶)
function toBold(text) {
  const normalChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const boldChars = '𝗮𝗯𝗰𝗱𝗲𝗳𝗴𝗵𝗶𝗷𝗸𝗹𝗺𝗻𝗼𝗽𝗾𝗿𝘀𝘁𝘂𝘃𝘄𝘅𝘆𝘇𝗔𝗕𝗖𝗗𝗘𝗙𝗚𝗛𝗜𝗝𝗞𝗟𝗠𝗡𝗢𝗣𝗤𝗥𝗦𝗧𝗨𝗩𝗪𝗫𝗬𝗭𝟬𝟭𝟮𝟯𝟰𝟱𝟲𝟳𝟴𝟵';
  return text.split("").map(c => {
    const index = normalChars.indexOf(c);
    return index !== -1 ? boldChars[index] : c;
  }).join("");
}

module.exports = {
  config: {
    name: "porn",
    version: "1.0",
    author: "Christus x Aesther",
    countDown: 5,
    role: 0,
    category: "media",
    shortDescription: "🎬 Recherche des vidéos porno",
    longDescription: "Recherche et affiche les vidéos de porn.com selon un mot-clé",
    guide: "{pn} <terme de recherche>",
    usePrefix: false,
    noPrefix: true
  },

  onStart: async function({ api, event, args }) {
    const query = args.join(" ");
    if (!query) return api.sendMessage(toBold("❌ | Veuillez fournir un terme de recherche."), event.threadID, event.messageID);

    const waitMsg = await api.sendMessage(toBold("🔍 | Recherche des vidéos en cours..."), event.threadID, null, event.messageID);

    try {
      const apiUrl = `https://www.eporner.com/api/v2/video/search/?query=${encodeURIComponent(query)}&format=json`;
      const res = await axios.get(apiUrl);
      const data = res.data;

      if (!data?.videos?.length) {
        return api.sendMessage(toBold(`❌ | Aucune vidéo trouvée pour: ${query}`), event.threadID, event.messageID);
      }

      const topVideos = data.videos.slice(0, 10);
      let output = `╔═══════════════\n║ 🔎 Résultats pour : ${query}\n╠═══════════════\n`;

      const attachments = [];

      for (let i = 0; i < Math.min(5, topVideos.length); i++) {
        const video = topVideos[i];
        output += `║ 📼 ${i + 1}. ${video.title}\n`;
        output += `║ ⏱️ ${video.length_min} min | 👍 ${video.rating}/5\n`;
        output += `║ 🌐 URL: https://www.eporner.com/video-${video.id}/${video.slug}/\n`;
        output += `╠────────────────\n`;

        // Téléchargement de la miniature
        try {
          const thumbRes = await axios.get(video.default_thumb.src, { responseType: "arraybuffer" });
          const filePath = path.join(__dirname, "cache", `thumb_${video.id}.jpg`);
          fs.writeFileSync(filePath, thumbRes.data);
          attachments.push(fs.createReadStream(filePath));
        } catch (e) {
          console.error(`❌ Impossible de récupérer la miniature pour la vidéo ${video.id}`);
        }
      }

      output += `║ Répondez avec le numéro (1-${Math.min(5, topVideos.length)}) pour obtenir l'URL directe\n╚═══════════════`;

      await api.sendMessage({ body: toBold(output), attachment: attachments }, event.threadID, () => api.unsendMessage(waitMsg.messageID), event.messageID);

      global.GoatBot.onReply.set(event.messageID, {
        commandName: "porn",
        author: event.senderID,
        messageID: event.messageID,
        videos: topVideos
      });

    } catch (err) {
      console.error(err);
      api.sendMessage(toBold("❌ | Échec de la récupération des vidéos."), event.threadID, event.messageID);
      api.unsendMessage(waitMsg.messageID);
    }
  },

  onReply: async function({ api, event, Reply }) {
    const { author, videos } = Reply;
    if (event.senderID !== author) return;

    const selectedNum = parseInt(event.body);
    if (isNaN(selectedNum)) return api.sendMessage(toBold("❌ | Veuillez répondre avec un numéro de la liste."), event.threadID, event.messageID);

    const videoIndex = selectedNum - 1;
    if (videoIndex < 0 || videoIndex >= Math.min(5, videos.length)) {
      return api.sendMessage(toBold("❌ | Sélection invalide. Choisissez un numéro de la liste."), event.threadID, event.messageID);
    }

    const video = videos[videoIndex];
    const videoUrl = `https://www.eporner.com/video-${video.id}/${video.slug}/`;

    await api.sendMessage(toBold(
      `╔═══════════════\n║ 🎥 ${video.title}\n║ ⏱️ ${video.length_min} min | 👍 ${video.rating}/5\n║ 🔗 URL directe : ${videoUrl}\n╚═══════════════`
    ), event.threadID, event.messageID);

    global.GoatBot.onReply.delete(event.messageID);
  }
};

// Activation noprefix via GoatWrapper
const wrapper = new g.GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: false });
