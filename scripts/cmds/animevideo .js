const axios = require("axios");
const g = require("fca-aryan-nix"); // GoatWrapper pour noprefix

module.exports = {
  config: {
    name: "animevideo",
    aliases: ["anivideo", "avideo"],
    version: "1.1",
    author: "Christus",
    countDown: 5,
    role: 0,
    shortDescription: "Obtenir une vidéo anime aléatoire",
    description: "Récupère et envoie une vidéo anime aléatoire avec ses détails",
    category: "media",
    guide: "{pn}",
    noPrefix: true // Activation noprefix
  },

  onStart: async function ({ message }) {
    const w = await message.reply("🎬 Recherche d'une vidéo anime aléatoire... Veuillez patienter.");

    try {
      const res = await axios.get("https://aryanapi.up.railway.app/api/animevideo");
      const response = res.data;

      if (!response?.data || !response.data.playUrl) {
        return message.reply("⚠ Impossible de récupérer la vidéo anime, réessayez plus tard.");
      }

      const data = response.data;

      const caption =
`🎬 ${data.title}
👤 Auteur : ${data.author}
📹 Uploader : ${data.user?.nickname || "Inconnu"}
👁 Vues : ${data.playCount}
❤ Likes : ${data.diggCount}
💬 Commentaires : ${data.commentCount}
🔁 Partages : ${data.shareCount}
⬇ Téléchargements : ${data.downloadCount}`;

      await message.reply({
        body: caption,
        attachment: await global.utils.getStreamFromURL(data.playUrl)
      });

      message.unsend(w.messageID);
    } catch (e) {
      console.error(e);
      message.reply("❌ Une erreur est survenue lors de la récupération de la vidéo anime.");
    }
  }
};

// Active le mode noprefix via GoatWrapper
const w = new g.GoatWrapper(module.exports);
w.applyNoPrefix({ allowPrefix: false });
