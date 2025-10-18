const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const g = require("fca-aryan-nix"); // GoatWrapper pour noprefix

module.exports = {
  config: {
    name: "enhance",
    version: "1.1",
    author: "Aesther x Christus",
    role: 0,
    category: "AI-IMAGE",
    shortDescription: { fr: "✨ Améliore la qualité d'une image (HD)" },
    longDescription: { fr: "Transforme ton image en version HD en utilisant l’API iHancer" },
    guide: { fr: "Répond à une photo avec : enhance" },
    noPrefix: true // Activation noprefix
  },

  onStart: async function ({ message, event, api }) {
    try {
      // Vérifie si on reply à une image
      if (!event.messageReply?.attachments?.[0] || event.messageReply.attachments[0].type !== "photo") {
        return message.reply("⚠️ Répond à une *photo* pour l’améliorer en HD !");
      }

      const attachment = event.messageReply.attachments[0];
      const imageUrl = encodeURIComponent(attachment.url);
      const cacheDir = path.join(__dirname, "cache");
      await fs.ensureDir(cacheDir);

      const waitMsg = await message.reply("🌸╭──────────────╮\n     🔧 Amélioration en cours...\n     Patiente un instant 💫\n╰──────────────╯");

      // Appel API iHancer
      const apiUrl = `https://aryanapi.up.railway.app/api/ihancer?url=${imageUrl}&type=&level=`;
      const response = await axios.get(apiUrl, { responseType: "arraybuffer" });

      // Sauvegarde du fichier
      const outputPath = path.join(cacheDir, `enhanced_${Date.now()}.jpg`);
      await fs.writeFile(outputPath, response.data);

      await message.reply({
        body: [
          "╭─━─━─━─━─━─━─╮",
          " ✨ 𝗜𝗺𝗮𝗴𝗲 𝗘𝗻𝗵𝗮𝗻𝗰𝗲𝗱 ✨",
          "   🌸 Version HD générée avec succès 🌸",
          "╰─━─━─━─━─━─━─╯"
        ].join("\n"),
        attachment: fs.createReadStream(outputPath)
      });

      // Supprime le message d’attente
      await api.unsendMessage(waitMsg.messageID);

      // Nettoyage automatique du cache (>10 min)
      const files = await fs.readdir(cacheDir);
      const now = Date.now();
      for (const file of files) {
        const fPath = path.join(cacheDir, file);
        const stat = await fs.stat(fPath);
        if (now - stat.mtimeMs > 10 * 60 * 1000) {
          await fs.unlink(fPath).catch(() => {});
        }
      }

    } catch (err) {
      console.error("Erreur Enhance :", err);
      message.reply("❌ Une erreur est survenue pendant l’amélioration de l’image.");
    }
  }
};

// Activation noprefix via GoatWrapper
const wrapper = new g.GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: false });
