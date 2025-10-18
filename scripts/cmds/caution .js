const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const g = require("fca-aryan-nix"); // GoatWrapper pour noprefix

module.exports = {
  config: {
    name: "caution",
    version: "1.1",
    author: "Christus",
    countDown: 5,
    role: 0,
    category: "𝗙𝗨𝗡 & 𝗝𝗘𝗨",
    shortDescription: { fr: "⚠️ Crée une image style attention avec ton texte" },
    longDescription: { fr: "Génère une image meme de style attention avec du texte personnalisé." },
    guide: { fr: "{pn} <texte>\nExemple : {pn} Attention à moi !" },
    noPrefix: true // Activation noprefix
  },

  langs: {
    fr: {
      missing: "❌ Veuillez fournir un texte pour générer l'image d'attention.",
      error: "❌ Impossible de générer l'image d'attention, veuillez réessayer."
    }
  },

  onStart: async function ({ message, args, getLang }) {
    if (!args.length) return message.reply(getLang("missing"));

    const text = encodeURIComponent(args.join(" "));

    try {
      const res = await axios.get(`https://api.popcat.xyz/v2/caution?text=${text}`, {
        responseType: "arraybuffer"
      });

      // Crée le dossier cache si nécessaire
      await fs.ensureDir(path.join(__dirname, "cache"));
      const filePath = path.join(__dirname, "cache", `caution_${Date.now()}.png`);
      fs.writeFileSync(filePath, res.data);

      await message.reply({
        body: `⚠️════════════════⚠️\nVoici ton image d'attention pour : "${args.join(" ")}"\n⚠️════════════════⚠️`,
        attachment: fs.createReadStream(filePath)
      });

      // Supprime le fichier après envoi
      fs.unlinkSync(filePath);
    } catch (err) {
      console.error(err);
      message.reply(getLang("error"));
    }
  }
};

// Activation noprefix via GoatWrapper
const w = new g.GoatWrapper(module.exports);
w.applyNoPrefix({ allowPrefix: false });
