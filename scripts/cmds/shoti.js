const axios = require("axios");
const fs = require("fs");
const path = require("path");
const g = require("fca-aryan-nix"); // GoatWrapper pour noprefix

module.exports = {
  config: {
    name: "shoti",
    version: "1.2",
    author: "Christus x Aesther",
    countDown: 5,
    role: 0,
    category: "MEDIA",
    shortDescription: "🎀 Récupère une vidéo Shoti aléatoire",
    longDescription: "Récupère une courte vidéo aléatoire depuis une API et l'envoie dans le chat avec un joli encadré.",
    guide: "{pn} → récupère une vidéo Shoti aléatoire",
    usePrefix: false,
    noPrefix: true
  },

  onStart: async function({ api, event }) {
    const videoDir = path.join(__dirname, "cache");
    const videoPath = path.join(videoDir, `shoti_${Date.now()}.mp4`);
    const apiUrl = "https://apis-top.vercel.app/aryan/shoti";

    try {
      if (!fs.existsSync(videoDir)) fs.mkdirSync(videoDir);

      const res = await axios.get(apiUrl);
      const data = res.data;

      if (!data || !data.videoUrl) {
        return api.sendMessage("❌ Échec de la récupération de la vidéo Shoti. L'API a renvoyé une réponse invalide.", event.threadID, event.messageID);
      }

      const { videoUrl, title, username, nickname, region } = data;

      const videoRes = await axios({
        method: "GET",
        url: videoUrl,
        responseType: "stream",
        headers: { "User-Agent": "Mozilla/5.0" },
      });

      const writer = fs.createWriteStream(videoPath);
      videoRes.data.pipe(writer);

      writer.on("finish", () => {
        const caption = `┌─🎬 𝐒𝐇𝐎𝐓𝐈 ───────────┐\n` +
                        `│ 📝 𝐓𝐢𝐭𝐫𝐞 : ${title || "Pas de titre"}\n` +
                        `│ 👤 𝐍𝐨𝐦 : ${username || "N/A"}\n` +
                        `│ 💬 𝐏𝐬𝐞𝐮𝐝𝐨 : ${nickname || "N/A"}\n` +
                        `│ 🌍 𝐑𝐞́𝐠𝐢𝐨𝐧 : ${region || "Inconnu"}\n` +
                        `└─────────────────────┘`;

        api.sendMessage(
          { body: caption, attachment: fs.createReadStream(videoPath) },
          event.threadID,
          () => fs.unlinkSync(videoPath),
          event.messageID
        );
      });

      writer.on("error", (err) => {
        console.error("❌ Erreur lors de l'écriture de la vidéo:", err);
        api.sendMessage("❌ Une erreur s'est produite lors de l'enregistrement de la vidéo.", event.threadID, event.messageID);
        if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
      });

    } catch (err) {
      console.error("❌ Erreur inattendue:", err.message);
      api.sendMessage("❌ Une erreur inattendue est survenue lors de la récupération de la vidéo Shoti. Veuillez réessayer plus tard.", event.threadID, event.messageID);
    }
  },
};

// Activation noprefix via GoatWrapper
const wrapper = new g.GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: false });
