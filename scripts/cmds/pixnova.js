const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const g = require("fca-aryan-nix"); // GoatWrapper pour noprefix

module.exports = {
  config: {
    name: "pixnova",
    version: "1.1",
    author: "Aesther x Christus",
    countDown: 5,
    role: 0,
    category: "image",
    shortDescription: "🖼️ Améliore la qualité d'une image",
    longDescription: "Transforme une image en version HD améliorée avec Pixnova.",
    guide: "{pn} (en reply à une photo)",
    usePrefix: false,
    noPrefix: true
  },

  onStart: async function ({ message, event }) {
    try {
      if (!event.messageReply || !event.messageReply.attachments || event.messageReply.attachments.length === 0) {
        return message.reply("⚠️ Répond à une image pour la rendre HD !");
      }

      const attachment = event.messageReply.attachments[0];
      if (attachment.type !== "photo") {
        return message.reply("❌ Tu dois répondre à une *photo* uniquement !");
      }

      const imageUrl = encodeURIComponent(attachment.url);
      const apiUrl = `https://aryanapi.up.railway.app/api/pixnova?url=${imageUrl}&scale=&request_from=bot`;

      const waitMsg = await message.reply("🪄╭──────────────╮\n   🌌 Amélioration Pixnova en cours...\n   Patiente un instant 💫\n╰──────────────╯");

      const res = await axios.get(apiUrl);
      if (!res.data.status) return message.reply("❌ Erreur : impossible de traiter l'image.");

      const hdImageUrl = res.data.result;

      const cacheDir = path.join(__dirname, "cache");
      fs.ensureDirSync(cacheDir);
      const outputPath = path.join(cacheDir, `pixnova_${Date.now()}.png`);
      const imageData = await axios.get(hdImageUrl, { responseType: "arraybuffer" });
      fs.writeFileSync(outputPath, imageData.data);

      await message.reply({
        body: [
          "╭─━─━─━─━─━─━─╮",
          " 🌟 𝗣𝗶𝘅𝗻𝗼𝘃𝗮 𝗖𝗼𝗺𝗽𝗹𝗲𝘁𝗲 ✅",
          "   🖼️ Image HD améliorée",
          "╰─━─━─━─━─━─━─╯"
        ].join("\n"),
        attachment: fs.createReadStream(outputPath)
      });

      await message.unsendMessage(waitMsg.messageID);

      // Nettoyage automatique du cache après 10 minutes
      const now = Date.now();
      const files = await fs.readdir(cacheDir);
      for (const file of files) {
        const filePath = path.join(cacheDir, file);
        const stat = await fs.stat(filePath);
        if (now - stat.mtimeMs > 10 * 60 * 1000) {
          await fs.unlink(filePath).catch(() => {});
        }
      }

    } catch (err) {
      console.error(err);
      message.reply("❌ Erreur : impossible de traiter cette image avec Pixnova.");
    }
  }
};

// Activation noprefix via GoatWrapper
const wrapper = new g.GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: false });
