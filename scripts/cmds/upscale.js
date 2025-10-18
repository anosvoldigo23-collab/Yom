// 📸 Dépendances nécessaires
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const g = require("fca-aryan-nix"); // 🟡 GoatWrapper pour activer le mode noprefix

module.exports = {
  config: {
    name: "upscale",
    version: "1.1",
    author: "Aesther ✨ x Christus 🧠",
    countDown: 5,
    role: 0,
    category: "🖼️ image",
    shortDescription: "📈 Améliore la qualité d’une image",
    longDescription: "Upscale une image (2x, 4x...) en un clic ✨. Répond simplement à une photo pour augmenter sa résolution.",
    guide: {
      fr:
        "╭─『 🖼️ 𝗨𝗣𝗦𝗖𝗔𝗟𝗘 𝗜𝗠𝗔𝗚𝗘 』\n" +
        "│\n" +
        "│ 🔸 Réponds à une image avec : upscale 4\n" +
        "│    ➥ x4 la résolution de l’image\n" +
        "│\n" +
        "│ ✨ Par défaut → x2 si aucun chiffre n’est donné\n" +
        "╰─────────────────────────────",
    },
    usePrefix: false,
    noPrefix: true
  },

  onStart: async function ({ message, event, args, api }) {
    try {
      // 📝 Vérification : l'utilisateur doit répondre à une photo
      if (
        !event.messageReply ||
        !event.messageReply.attachments ||
        event.messageReply.attachments.length === 0
      ) {
        return message.reply("⚠️ Répond à une image pour l’agrandir !");
      }

      const attachment = event.messageReply.attachments[0];
      if (attachment.type !== "photo") {
        return message.reply("❌ Tu dois répondre à une *photo* uniquement !");
      }

      // 🧠 Récupération du facteur d’upscale
      const scale = args[0] || 2;
      const imageUrl = encodeURIComponent(attachment.url);
      const apiUrl = `https://aryanapi.up.railway.app/api/imagewith?url=${imageUrl}&scale=${scale}`;

      // ⏳ Message d'attente stylé
      const waitMsg = await message.reply(
        "╭─『 🪄 𝗨𝗣𝗦𝗖𝗔𝗟𝗘 𝗜𝗠𝗔𝗚𝗘 』\n" +
        "│ 🔍 Amélioration de la résolution en cours...\n" +
        "│ 💫 Merci de patienter un instant\n" +
        "╰─────────────────────────────"
      );

      // 🌐 Requête à l'API Upscale
      const res = await axios.get(apiUrl);
      const data = res.data;

      if (!data.status || !data.url) {
        return message.reply("❌ Impossible d’obtenir l’image upscalée.");
      }

      // 💾 Téléchargement de l’image upscalée
      const imgRes = await axios.get(data.url, { responseType: "arraybuffer" });
      const cacheDir = path.join(__dirname, "cache");
      fs.ensureDirSync(cacheDir);

      const outputPath = path.join(cacheDir, `upscaled_${Date.now()}.jpg`);
      fs.writeFileSync(outputPath, imgRes.data);

      // 📤 Envoi du résultat final
      await message.reply({
        body:
          "╭─━─━─━─━─━─━─╮\n" +
          " 🚀 𝗨𝗽𝘀𝗰𝗮𝗹𝗶𝗻𝗴 𝗖𝗼𝗺𝗽𝗹𝗲́𝘁 ✅\n" +
          `   ✨ Résolution augmentée x${scale}\n` +
          "╰─━─━─━─━─━─━─╯",
        attachment: fs.createReadStream(outputPath)
      });

      // ❌ Suppression du message d’attente
      await api.unsendMessage(waitMsg.messageID);

      // 🧹 Nettoyage automatique du cache (10 min)
      const now = Date.now();
      const files = await fs.readdir(cacheDir);
      for (const file of files) {
        const fPath = path.join(cacheDir, file);
        const stat = await fs.stat(fPath);
        if (now - stat.mtimeMs > 10 * 60 * 1000) {
          await fs.unlink(fPath).catch(() => {});
        }
      }

    } catch (err) {
      console.error(err);
      message.reply("❌ Erreur : impossible d’upscaler cette image.");
    }
  }
};

// 🟡 Activation du mode noprefix via GoatWrapper
const wrapper = new g.GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: false });
