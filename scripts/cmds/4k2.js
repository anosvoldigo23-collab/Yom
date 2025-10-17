const axios = require("axios");
const fs = require("fs");
const path = require("path");

const CACHE_DIR = path.join(__dirname, "cache");

module.exports = {
  config: {
    name: "4k",
    aliases: ["amelioration"],
    version: "1.0",
    author: "Christus",
    countDown: 5,
    role: 0,
    shortDescription: { fr: "Améliore l'image en 4K" },
    longDescription: { fr: "Envoyez une URL d'image ou joignez une image, le bot l'améliorera en 4K en utilisant l'API Aryan." },
    category: "media",
    guide: { fr: "{pn} <URL de l'image>\n\nOu répondez à une image avec {pn}" }
  },

  onStart: async function ({ api, args, event }) {
    if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });

    let imageUrl = args[0]; 

    if (!imageUrl && event.messageReply && event.messageReply.attachments.length > 0) {
      imageUrl = event.messageReply.attachments[0].url;
    }

    if (!imageUrl) {
      return api.sendMessage("❌ Veuillez fournir une URL d'image ou répondre à une image.", event.threadID, event.messageID);
    }

    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    try {
      const apiUrl = `https://aryanapi.up.railway.app/api/videoconverter?url=${encodeURIComponent(imageUrl)}&scale=2`;
      const res = await axios.get(apiUrl, { timeout: 30000 });
      const upscaledUrl = res.data?.result;

      if (!upscaledUrl) {
        return api.sendMessage("❌ Impossible d'améliorer l'image.", event.threadID, event.messageID);
      }

      const fileRes = await axios.get(upscaledUrl, { responseType: "stream" });
      const filename = `4k_${Date.now()}.jpg`;
      const filepath = path.join(CACHE_DIR, filename);
      const writer = fs.createWriteStream(filepath);

      fileRes.data.pipe(writer);

      writer.on("finish", () => {
        api.sendMessage({
          body: "✅ Voici votre image améliorée en 4K :",
          attachment: fs.createReadStream(filepath)
        }, event.threadID, () => { 
          try { fs.unlinkSync(filepath); } catch {} 
        }, event.messageID);

        api.setMessageReaction("✅", event.messageID, () => {}, true);
      });

      writer.on("error", (err) => {
        console.error("❌ Erreur lors de l'écriture du fichier :", err.message);
        api.sendMessage("❌ Une erreur est survenue lors de l'enregistrement de l'image améliorée.", event.threadID, event.messageID);
        api.setMessageReaction("❌", event.messageID, () => {}, true);
      });

    } catch (err) {
      console.error("❌ Erreur lors de l'amélioration de l'image :", err.message);
      api.sendMessage("❌ Impossible d'améliorer l'image.", event.threadID, event.messageID);
      api.setMessageReaction("❌", event.messageID, () => {}, true);
    }
  }
};