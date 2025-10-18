const fs = require("fs-extra");
const path = require("path");
const https = require("https");
const axios = require("axios");
const g = require("fca-aryan-nix"); // GoatWrapper pour noprefix

module.exports = {
  config: {
    name: "waifu2",
    version: "1.1",
    author: "Christus x Aesther",
    countDown: 5,
    role: 0,
    category: "fun",
    shortDescription: "🌸 Envoie une illustration d’anime mignonne (SFW)",
    longDescription: "Récupère des images d’anime sûres (non R18) depuis l’API Lolicon.",
    guide: "{pn}",
    usePrefix: false,
    noPrefix: true
  },

  onStart: async function({ message }) {
    try {
      const res = await axios.post("https://api.lolicon.app/setu/v2", {
        r18: 0,
        num: 1
      });

      if (!res.data?.data || res.data.data.length === 0) {
        return message.reply("❌ Aucune image trouvée.");
      }

      const imageUrl = res.data.data[0].urls.original || res.data.data[0].urls.regular;
      const cacheDir = path.join(__dirname, "cache");
      await fs.ensureDir(cacheDir);
      const filePath = path.join(cacheDir, `waifu2_${Date.now()}.jpg`);

      const file = fs.createWriteStream(filePath);
      https.get(imageUrl, resImg => {
        resImg.pipe(file);
        file.on("finish", () => {
          const caption = `
╭─🌸 𝗪𝗮𝗶𝗳𝘂 𝗧𝗵𝗲 𝗖𝘂𝘁𝗲 𝗠𝗮𝗴𝗶𝗰 🌸─╮
✨ Illustration d’anime mignonne ✨
🌐 Source : API Lolicon
╰─────────────────────────────╯
          `;
          message.reply({
            body: caption.trim(),
            attachment: fs.createReadStream(filePath)
          });
        });
      }).on("error", () => {
        message.reply("❌ Une erreur est survenue lors du téléchargement de l’image.");
      });

    } catch (error) {
      message.reply("❌ Une erreur est survenue lors de la récupération de l’image.");
    }
  }
};

// ⚡ Activation NOPREFIX via GoatWrapper
const wrapper = new g.GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: false });
